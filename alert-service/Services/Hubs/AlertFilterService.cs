using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
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

		public async Task<List<Alert>> GetAlertsSatisfyOption(List<Alert> alerts, AlertOption alertOption)
		{
			if (alertOption is null)
				return null;
			var hasRange = false;
			var filter = alerts.Where(alert => alert.Type == alertOption.TypeKey || alert.Type == alertOption.TypeKey2);


			if (!string.IsNullOrEmpty(alertOption.Exchange))
			{
				var filterExchanges = alertOption.Exchange.Split(',').ToList();
				filter = filter.Where(alert => filterExchanges.Contains(alert.Exchange));
				hasRange = true;
			}

			if (!(alertOption.Symbols is null))
			{
				filter = filter.Where(alert => alertOption.Symbols.Any(stock => stock.Symbol == alert.Symbol && stock.ExchangeCode == alert.Exchange));
				hasRange = true;
			}
			if (!hasRange)
			{
				return new List<Alert>();
			}
			var ret = filter.ToList();
			if (alertOption.Average5Volume.HasValue)
			{
				var prices = await _dataProvider.GetLatestMultiStockData(ret.Select(alert => alert.Symbol).ToList());
				ret = ret.Where(alert =>
				{
					if (!prices.ContainsKey(alert.Symbol))
					{
						return true;
					}
					var ohlcs = prices[alert.Symbol]?.HistoricalPrice;
					if (ohlcs == null)
					{
						return true;
					}
					var last5 = Utils.GetLastNTradingDay(ohlcs, null, 5);
					var avg = last5.Average(x => x.Volume);
					if (alertOption.Average5Volume > avg)
					{
						return true;
					}
					return false;
				}).ToList();
			}
            var compRet = new List<Alert>();
			if (!string.IsNullOrEmpty(alertOption.TypeKey) && !string.IsNullOrEmpty(alertOption.TypeKey2))
			{
				var grBySymbolTimestamp = ret.GroupBy(x => new { x.Symbol, x.Exchange, x.MessageTimestamp })
											.ToDictionary(g => g.Key, g => g.ToList());
				foreach (var pair in grBySymbolTimestamp)
				{
                    var satisfied1 = pair.Value.FirstOrDefault(alert => alert.Type == alertOption.TypeKey);
                    var satisfied2 = pair.Value.FirstOrDefault(alert => alert.Type == alertOption.TypeKey2);
					if (satisfied1 != null && satisfied2 != null)
					{
                        var compAlert = satisfied1.CreateCopy();
                        compAlert.Message += " và " + satisfied2.Message;
                        compRet.Add(compAlert);
					}
				}
                return compRet;
			}

			return ret;
		}
	}
}