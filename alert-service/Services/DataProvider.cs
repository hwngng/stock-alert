using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AlertService.Services.Common;
using AlertService.Services.Interfaces;
using AlertService.Services.Models;
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

		public DataProvider(IConfiguration config, ILogger<DataProvider> logger)
		{
			_config = config;
			_logger = logger;
			_parseOptions = new JsonSerializerOptions
			{
				Converters = { new NullableConverterFactory(), new CustomDateTimeConverter() },
				NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString
			};
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

		public async Task<List<OHLCV>> GetHistoricalPrice(string code, DateTime startFrom, DateTime? toDate = null)
		{
			return new List<OHLCV>();
		}

		public async Task<SFUGeneral> GetSnapshot(string code)
		{
			var multiRes = await this.GetMultiSnapshot(new List<string> { code });
			var result = multiRes?.FirstOrDefault();

			return result;
		}
	}
}