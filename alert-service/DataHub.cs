using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AlertService.Common;
using AlertService.Interfaces;
using AlertService.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RestSharp;

namespace AlertService
{
	public class DataHub : IDataHub
	{
		private readonly IConfiguration _config;
		private readonly ILogger<DataHub> _logger;
		private readonly JsonSerializerOptions _parseOptions;

		public DataHub(IConfiguration config, ILogger<DataHub> logger)
		{
			_config = config;
			_logger = logger;
			_parseOptions = new JsonSerializerOptions
			{
				Converters = { new NullableConverterFactory() },
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
                var response = await client.ExecuteAsync<List<OHLCVDataService>>(request);
                var resObj = JsonSerializer.Deserialize<List<OHLCVDataService>>(response.Content);
            } catch (Exception e) {
                _logger.LogWarning(e,"Cannot get historical price");
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