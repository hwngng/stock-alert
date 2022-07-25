using System.Linq;
using System.Threading.Tasks;
using AlertService.Models;
using AlertService.Services.Common;
using AlertService.Services.Interfaces;
using AlertService.Services.Models;

namespace AlertService.Services.Hubs
{
    public class AlertFilterService
    {
        private readonly IDataProvider _dataProvider;
        public AlertFilterService(IDataProvider dataProvider)
        {
            _dataProvider = dataProvider;
        }

        public async Task<bool> CanAlert(Alert alert, AlertOption alertOption)
        {
            if (alertOption is null)
                return false;
            if (!string.IsNullOrEmpty(alertOption.Exchange))
            {
                var exchange = alert?.Exchange?.Split(',').ToList();
                var alertStockInfo = await _dataProvider.GetLatestStockInfo(alert.Symbol);
                if (!exchange.Contains(alertStockInfo.ExchangeCode))
                {
                    return false;
                }
            }

            if (!(alertOption.Symbols is null))
            {
                if (!alertOption.Symbols.Select(x => x.Symbol).Contains(alert.Symbol))
                {
                    return false;
                }
            }

            if (alertOption.Average5Volume.HasValue)
            {
                var ohlcs = await _dataProvider.GetHistoricalPrice(alert.Symbol);
                var last5 = Utils.GetLastNTradingDay(ohlcs, null, 5);
                var avg = last5.Average(x => x.Volume);
                if (alertOption.Average5Volume < avg)
                {
                    return false;
                }
            }

            return true;
        }
    }
}