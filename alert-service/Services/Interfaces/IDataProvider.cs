using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlertService.Services.Models;
using AlertService.Services.Models.Indicator;

namespace AlertService.Services.Interfaces
{
    public interface IDataProvider
    {
        Task<List<SFUGeneral>> GetMultiSnapshot (List<string> codes);

        Task<Dictionary<string, List<OHLCV>>> GetMultiHistoricalPrice (List<string> codes, DateTime startFrom, DateTime? toDate = null);

        Task<SFUGeneral> GetSnapshot (string code);

        Task<List<OHLCV>> GetHistoricalPrice (string code, DateTime? startFrom = null, DateTime? toDate = null);

        Task<Stock> GetLatestStockData(string code);

        Task<SMA> GetSMAIndicator(string code, int period);
    }
}