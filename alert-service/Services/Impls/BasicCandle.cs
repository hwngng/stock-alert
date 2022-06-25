using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AlertService.Services.Common;
using AlertService.Services.Hubs;
using AlertService.Services.Interfaces;
using AlertService.Services.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlertService.Services.Impls
{
	public class BasicCandle : BaseCandleAlert
	{
		private JsonSerializerOptions _parseOptions;
		public BasicCandle(IConfiguration config,
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

				addAlertIfNotNull(alerts, CreateAlert(sma.Symbol, Test(stockData, sma)));
				addAlertIfNotNull(alerts, CreateAlert(sma.Symbol, BullishEngulfing(stockData, sma)));
				addAlertIfNotNull(alerts, CreateAlert(sma.Symbol, BearishEngulfing(stockData, sma)));
				addAlertIfNotNull(alerts, CreateAlert(sma.Symbol, ThreeBlackCrows(stockData, sma)));
				addAlertIfNotNull(alerts, CreateAlert(sma.Symbol, ThreeWhiteSoldiers(stockData, sma)));
				addAlertIfNotNull(alerts, CreateAlert(sma.Symbol, Hammer(stockData, sma)));
				addAlertIfNotNull(alerts, CreateAlert(sma.Symbol, InvertedHammer(stockData, sma)));
				addAlertIfNotNull(alerts, CreateAlert(sma.Symbol, EveningStar(stockData, sma)));
				addAlertIfNotNull(alerts, CreateAlert(sma.Symbol, MorningStar(stockData, sma)));

				Console.WriteLine("Symbol: {0}, Alert: {1}", sma.Symbol, JsonSerializer.Serialize(alerts));
				await _alertHub.Clients.All.Alert(alerts);
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error ");
			}
		}

		public string Test(Stock stockData, SMAGeneral sma, string symbol = "")
		{
			return JsonSerializer.Serialize(stockData.HistoricalPrice.Last()) + " " + JsonSerializer.Serialize(sma);
		}

		public string BearishEngulfing(Stock stockData, SMAGeneral sma, string symbol = "")
		{
			var last2 = getLastNTradingDay(stockData.HistoricalPrice, sma, 2);
			if (last2 is null || last2.Count != 2)
				return null;
			if (!CandlePatterns.IsBearishEngulfingCandles(last2[0], last2[1]))
				return null;

			return AlertMessageFormat.BearishEngulfing;
		}

		public string BullishEngulfing(Stock stockData, SMAGeneral sma, string symbol = "")
		{
			var last2 = getLastNTradingDay(stockData.HistoricalPrice, sma, 2);
			if (last2 is null || last2.Count != 2)
				return null;
			if (!CandlePatterns.IsBullishEngulfingCandles(last2[0], last2[1]))
				return null;
			
			return AlertMessageFormat.BullishEngulfing;
		}

		public string Hammer(Stock stockData, SMAGeneral sma, string symbol = "")
		{
			var last1 = getLastNTradingDay(stockData.HistoricalPrice, sma, 1);
			if (last1 is null || last1.Count != 1)
				return null;
			if (!CandlePatterns.IsHammerCandle(last1[0]))
				return null;
			
			return AlertMessageFormat.Hammer;
		}

		public string InvertedHammer(Stock stockData, SMAGeneral sma, string symbol = "")
		{
			var last1 = getLastNTradingDay(stockData.HistoricalPrice, sma, 1);
			if (last1 is null || last1.Count != 1)
				return null;
			if (!CandlePatterns.IsInvertedHammerCandle(last1[0]))
				return null;
			
			return AlertMessageFormat.InvertedHammer;
		}

		public string MorningStar(Stock stockData, SMAGeneral sma, string symbol = "")
		{
			var last3 = getLastNTradingDay(stockData.HistoricalPrice, sma, 3);
			if (last3 is null || last3.Count != 3)
				return null;
			if (!CandlePatterns.IsMorningStarCandles(last3[0], last3[1], last3[2]))
				return null;
			
			return AlertMessageFormat.MorningStar;
		}

		public string EveningStar(Stock stockData, SMAGeneral sma, string symbol = "")
		{
			var last3 = getLastNTradingDay(stockData.HistoricalPrice, sma, 3);
			if (last3 is null || last3.Count != 3)
				return null;
			if (!CandlePatterns.IsEveningStarCandles(last3[0], last3[1], last3[2]))
				return null;
			
			return AlertMessageFormat.EveningStar;
		}

		public string ThreeWhiteSoldiers(Stock stockData, SMAGeneral sma, string symbol = "")
		{
			var last3 = getLastNTradingDay(stockData.HistoricalPrice, sma, 3);
			if (last3 is null || last3.Count != 3)
				return null;
			if (!CandlePatterns.IsThreeWhiteSoldiersCandles(last3[0], last3[1], last3[2]))
				return null;
			
			return AlertMessageFormat.ThreeWhiteSoldiers;
		}

		public string ThreeBlackCrows(Stock stockData, SMAGeneral sma, string symbol = "")
		{
			var last3 = getLastNTradingDay(stockData.HistoricalPrice, sma, 3);
			if (last3 is null || last3.Count != 3)
				return null;
			if (!CandlePatterns.IsThreeBlackCrowsCandles(last3[0], last3[1], last3[2]))
				return null;
			
			return AlertMessageFormat.ThreeBlackCrows;
		}
	}
}