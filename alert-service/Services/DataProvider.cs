using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AlertService.Services.Common;
using AlertService.Services.Domain;
using AlertService.Services.Interfaces;
using AlertService.Services.Models;
using AlertService.Services.Models.Indicator;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RestSharp;

namespace AlertService.Services
{
	public class DataProvider : IDataProvider
	{
		private readonly IConfiguration _config;
		private readonly ILogger<DataProvider> _logger;
		private readonly JsonSerializerOptions _parseOptions;
		private readonly IDistributedCache _cache;
		private readonly Dictionary<string, Stock> _data;
		private readonly Dictionary<string, List<SMA>> _smaIndicator;
		private readonly Dictionary<string, Mutex> _stockDataReadMutex;

		public DataProvider(IConfiguration config, ILogger<DataProvider> logger, IDistributedCache cache)
		{
			_config = config;
			_logger = logger;
			_parseOptions = new JsonSerializerOptions
			{
				Converters = { new NullableConverterFactory(), new CustomDateTimeConverter() },
				NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString
			};
			_cache = cache;
			_data = new Dictionary<string, Stock>();
			_smaIndicator = new Dictionary<string, List<SMA>>();
			_stockDataReadMutex = new Dictionary<string, Mutex>();
		}

		public async Task<List<SFUGeneral>> GetMultiSnapshot(List<string> codes)
		{
			List<SFUGeneral> result = null;
			try
			{
				var client = new RestClient(_config["DataServiceApi"]);
				var request = new RestRequest(DataServiceApi.Snapshot, Method.Get);
				var codesParam = new QueryParameter("codes", string.Join(',', codes));
				request.AddParameter(codesParam);
				var response = await client.ExecuteAsync(request);
				result = JsonSerializer.Deserialize<List<SFUGeneral>>(response.Content, _parseOptions);
			}
			catch (Exception e)
			{
				_logger.LogWarning(e, "Cannot get snapshot");
			}
			return result;
		}

		public async Task<Dictionary<string, List<OHLCV>>> GetMultiHistoricalPrice(List<string> codes, DateTime startFrom, DateTime? toDate = null)
		{
			Dictionary<string, List<OHLCV>> result = null;
			try
			{
				var client = new RestClient(_config["DataServiceApi"]);
				var request = new RestRequest(DataServiceApi.HistoricalPrice, Method.Get);
				var codesParam = new QueryParameter("codes", string.Join(',', codes));
				var epochSecFromParam = new QueryParameter("epoch_sec_from", Utils.GetEpochTimeSec(startFrom).ToString());
				request.AddParameter(codesParam);
				request.AddParameter(epochSecFromParam);
				var response = await client.ExecuteAsync(request);
				var resObj = JsonSerializer.Deserialize<List<OHLCVDataService>>(response.Content, _parseOptions);
				result = resObj
								?.GroupBy(x => x.Symbol)
								?.ToDictionary(g => g.Key, g => g.Select(x => new OHLCV
								{
									Date = x.Date,
									Open = x.Open,
									High = x.High,
									Low = x.Low,
									Close = x.Close,
									Volume = x.Volume
								}).ToList());
			}
			catch (Exception e)
			{
				_logger.LogWarning(e, "Cannot get historical price");
			}

			return result;
		}

		public async Task<List<OHLCV>> GetHistoricalPrice(string code, DateTime? startFrom = null, DateTime? toDate = null)
		{
			List<OHLCV> result = null;
			try
			{
				var client = new RestClient(_config["DataServiceApi"]);
				var request = new RestRequest(DataServiceApi.HistoricalPriceCurrent, Method.Get);
				var codesParam = new QueryParameter("code", string.Join(',', code));
				if (startFrom.HasValue)
				{
					var epochSecFromParam = new QueryParameter("epoch_sec_from", Utils.GetEpochTimeSec(startFrom.Value).ToString());
					request.AddParameter(epochSecFromParam);
				}
				if (toDate.HasValue)
				{
					var epochSecToParam = new QueryParameter("epoch_sec_to", Utils.GetEpochTimeSec(toDate.Value).ToString());
					request.AddParameter(epochSecToParam);
				}
				request.AddParameter(codesParam);
				var response = await client.ExecuteAsync(request);
				var resObj = JsonSerializer.Deserialize<List<OHLCVDataService>>(response.Content, new JsonSerializerOptions
				{
					NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString
				});
				result = resObj?.Select(x => new OHLCV
				{
					Date = x.Date,
					Open = x.Open,
					High = x.High,
					Low = x.Low,
					Close = x.Close,
					Volume = x.Volume
				})
				.OrderBy(x => x.Date)
				.ToList();
			}
			catch (Exception e)
			{
				_logger.LogWarning(e, "Cannot get historical price");
			}

			return result;
		}

		public async Task<Stock> GetLatestStockData(string code)
		{
			try
			{
				var lockKey = string.Format(CacheKey.LockGetStockData, code);
				var isLocked = false;
				var lockRetry = 0;
				do
				{
					isLocked = _cache.GetString(lockKey) == "1";
					if (isLocked)
					{
						await Task.Delay(1000);
					}
					lockRetry++;
				}
				while (isLocked && lockRetry <= 3);

				if (_data.ContainsKey(code) && isSynced(_data[code].LastSync))
				{
					return _data[code];
				}
				else
				{
					_cache.SetString(lockKey, "1");
					var newStock = await getStockDataFromCache(code);
					_data[newStock.Symbol] = newStock;
					_cache.Remove(lockKey);
					return newStock;
				}
				// }
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Cannot get stock data");
				throw e;
			}
		}

		public async Task<SMA> GetSMAIndicator(string code, int period)
		{
			var stockData = await GetLatestStockData(code);
			if (_smaIndicator.ContainsKey(code)
				&& !(_smaIndicator[code] is null)
				&& _smaIndicator[code].Any(x => x.Period == period))
			{
				var currentSma = _smaIndicator[code].First(x => x.Period == period);
				if (currentSma.Points.Last().Date == stockData.HistoricalPrice.Last().Date)
					return currentSma;
			}
			var updatedSma = Indicator.GetSMA(stockData.HistoricalPrice, period);
			if (_smaIndicator[code] is null)
				_smaIndicator[code] = new List<SMA>();
			_smaIndicator[code].RemoveAll(x => x.Period == period);
			_smaIndicator[code].Add(updatedSma);

			return updatedSma;
		}

		private async Task<Stock> getStockDataFromCache(string code)
		{
			var cacheKey = string.Format(CacheKey.StockData, code);
			var stockCached = _cache.GetString(cacheKey);
			if (string.IsNullOrEmpty(stockCached))
			{
				var stock = await getStockDataFromDataService(code);
				var stockStr = JsonSerializer.Serialize(stock);
				_cache.SetString(cacheKey, stockStr);
				return stock;
			}
			else
			{
				var stock = JsonSerializer.Deserialize<Stock>(stockCached);
				if (isSynced(stock.LastSync))
					return stock;
				// merge new data
				var dtFrom = stock.LastSync.AddDays(1);
				var newData = await GetHistoricalPrice(code, dtFrom);
				if (!(newData is null))
				{
					stock.HistoricalPrice.AddRange(newData);
				}
				updateDataLastSync(stock);
				var stockStr = JsonSerializer.Serialize(stock);
				_cache.SetString(cacheKey, stockStr);

				return stock;
			}
		}

		private void updateDataLastSync(Stock data)
		{
			if (data.HistoricalPrice.Count > 0)
				data.LastSync = data.HistoricalPrice[data.HistoricalPrice.Count - 1].Date;
			else
				data.LastSync = DateTime.UtcNow.Date;
		}
		private async Task<Stock> getStockDataFromDataService(string code)
		{
			var stock = new Stock();
			stock.Symbol = code;
			stock.HistoricalPrice = await GetHistoricalPrice(code);
			updateDataLastSync(stock);

			return stock;
		}

		private bool isSynced(DateTime latestDataDate)
		{
			var now = DateTime.UtcNow;
			var latestDate = GetNearestTradingDay(now);
			// today is trading day but before atc, then lasted data is previous trading day
			if (now.Date == latestDate && IsBeforeATCTime(now))
			{
				latestDate = GetNearestTradingDay(now.AddDays(-1));
			}
			if (latestDataDate == latestDate)
				return true;
			return false;
		}

		public bool IsInTradingSession(DateTime dt)
		{
			var currentTime = dt.TimeOfDay;
			var openingTime = new TimeSpan(2, 0, 0);
			var closingTime = new TimeSpan(7, 45, 0);
			if (currentTime > openingTime && dt.TimeOfDay < closingTime)
				return true;
			return false;
		}

		public bool IsBeforeATCTime(DateTime dt)
		{
			var currentTime = dt.TimeOfDay;
			var atcTime = new TimeSpan(2, 15, 0);
			if (currentTime < atcTime)
				return true;
			return false;
		}

		public bool IsTradingDay(DateTime dt)
		{
			if (dt.DayOfWeek == DayOfWeek.Saturday || dt.DayOfWeek == DayOfWeek.Sunday)
				return false;
			return true;
		}

		public DateTime GetNearestTradingDay(DateTime from)
		{
			if (from.DayOfWeek == DayOfWeek.Sunday)
				return from.AddDays(-2).Date;
			if (from.DayOfWeek == DayOfWeek.Saturday)
				return from.AddDays(-2).Date;

			return from.Date;
		}

		public async Task<SFUGeneral> GetSnapshot(string code)
		{
			var multiRes = await this.GetMultiSnapshot(new List<string> { code });
			var result = multiRes?.FirstOrDefault();

			return result;
		}
	}
}