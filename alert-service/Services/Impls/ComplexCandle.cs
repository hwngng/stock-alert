using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AlertService.Services.Common;
using AlertService.Services.Domain;
using AlertService.Services.Hubs;
using AlertService.Services.Interfaces;
using AlertService.Services.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlertService.Services.Impls
{
	public class ComplexCandle : BaseCandleAlert
	{
        private JsonSerializerOptions _parseOptions;
		public ComplexCandle(IConfiguration config,
							ILogger<DataProvider> logger,
							IDataProvider dataProvider,
							IHubContext<AlertHub, IAlert> alertHub) : base(config, logger, dataProvider, alertHub)
		{
			_parseOptions = new JsonSerializerOptions
			{
				Converters = { new NullableConverterFactory() },
				NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString
			};
		}

		public override async Task ProcessMessage(SocketMessage msg)
		{
			try
			{
				if (msg?.Message?.MessageType != MessageType.SMA)
					return;
				var msgJson = JsonSerializer.Serialize(Convert.ChangeType(msg.Message, msg.Message.GetType()));
				var sma = JsonSerializer.Deserialize<SMAGeneral>(msgJson, _parseOptions);
				if (!sma.MatchPrice.HasValue)
				{
					_logger.LogWarning("Message does not have match price: {msg}", msgJson);
					return;
				}
				if (_lastScanPrice.ContainsKey(sma.Symbol))
				{
					var change = Utils.GetChangeRatio(_lastScanPrice[sma.Symbol].MatchPrice.Value, sma.MatchPrice.Value);
					Console.WriteLine(string.Format("Symbol: {3}. Ratio change: {0}. Last value: {1}. Current value: {2}", change, _lastScanPrice[sma.Symbol].MatchPrice.Value, sma.MatchPrice.Value, sma.Symbol));
					if (Math.Abs(change) < _config.GetValue<decimal>("ScanRatio"))
					{
						return;
					}
				}
				_lastScanPrice[sma.Symbol] = sma;
				var stockData = await _dataProvider.GetLatestStockData(sma.Symbol);

				var alerts = new List<Alert>();

				addAlertIfNotNull(alerts, CreateAlert(sma.Symbol, CupWithHandle(stockData, sma)));

				Console.WriteLine("Symbol: {0}, Alert: {1}", sma.Symbol, JsonSerializer.Serialize(alerts));
				await _alertHub.Clients.All.Alert(alerts);
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error ");
			}
		}

        public string CupWithHandle(Stock stockData, SMAGeneral sma, int range = 280)
        {
			var lastRange = getLastNTradingDay(stockData.HistoricalPrice, sma, range);
            var sma1 = Indicator.GetSMA(lastRange, 1);
			var cwhs = new List<CupWithHandle>();

			for(var i = sma1.Points.Count - 1; i > 5*5; --i)		// 8 week
			{
				var cwh = CandlePatterns.GetNearestCupWithHandle(sma1, i);
				if (cwh is null)
					continue;
				cwhs.Add(cwh);
				i = cwh.DipIndex;
			}
			
			string message = cwhs.Count > 0 ? JsonSerializer.Serialize(cwhs) : null;
			return message;
        }
	}
}