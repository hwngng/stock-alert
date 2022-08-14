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
using Microsoft.Extensions.Caching.Distributed;
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
							AlertPublisher alertPublisher,
							IDistributedCache cache) : base(config, logger, dataProvider, alertPublisher, cache)
		{
			_parseOptions = new JsonSerializerOptions
			{
				Converters = { new NullableConverterFactory() },
				NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString
			};
			_selfManageType = new List<string>
			{
				AlertTypeConstant.Test,
				AlertTypeConstant.BullishEngulfing,
				AlertTypeConstant.BearishEngulfing,
				AlertTypeConstant.ThreeBlackCrows,
				AlertTypeConstant.ThreeWhiteSoldiers,
				AlertTypeConstant.Hammer,
				AlertTypeConstant.InvertedHammer,
				AlertTypeConstant.EveningStar,
				AlertTypeConstant.MorningStar
			};
		}

		public override async Task<List<Alert>> ProcessMessage(SocketMessage msg)
		{
			if (msg?.Message?.MessageType != MessageType.SMA)
				return null;
			var msgJson = JsonSerializer.Serialize(Convert.ChangeType(msg.Message, msg.Message.GetType()));
			try
			{
				var sma = JsonSerializer.Deserialize<SMAGeneral>(msgJson, _parseOptions);
				if (!sma.MatchPrice.HasValue)
				{
					_logger.LogWarning("Message does not have match price: {msg}", msgJson);
					return null;
				}
				if (_lastScanPrice.ContainsKey(sma.Symbol))
				{
					var change = Utils.GetChangeRatio(_lastScanPrice[sma.Symbol].MatchPrice.Value, sma.MatchPrice.Value);
					// Console.WriteLine(string.Format("Symbol: {3}. Ratio change: {0}. Last value: {1}. Current value: {2}", change, _lastScanPrice[sma.Symbol].MatchPrice.Value, sma.MatchPrice.Value, sma.Symbol));
					if (Math.Abs(change) < _config.GetValue<decimal>("ScanRatio"))
					{
						return null;
					}
				}
				_lastScanPrice[sma.Symbol] = sma;
				var stockData = await _dataProvider.GetLatestStockData(sma.Symbol);
				var exchange = (await _dataProvider.GetLatestStockInfo(sma.Symbol)).ExchangeCode;

				var alerts = new List<Alert>();

				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.Test, sma.Symbol, Test(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.BullishEngulfing, sma.Symbol, BullishEngulfing(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.BearishEngulfing, sma.Symbol, BearishEngulfing(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.ThreeBlackCrows, sma.Symbol, ThreeBlackCrows(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.ThreeWhiteSoldiers, sma.Symbol, ThreeWhiteSoldiers(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.Hammer, sma.Symbol, Hammer(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.InvertedHammer, sma.Symbol, InvertedHammer(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.EveningStar, sma.Symbol, EveningStar(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.MorningStar, sma.Symbol, MorningStar(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.HangingMan, sma.Symbol, HangingMan(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.ShootingStar, sma.Symbol, ShootingStar(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.WhiteMarubozu, sma.Symbol, WhiteMarubozu(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.BlackMarubozu, sma.Symbol, BlackMarubozu(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.BullishCounterAttack, sma.Symbol, BullishCounterAttack(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.BearishCounterAttack, sma.Symbol, BearishCounterAttack(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.BullishHarami, sma.Symbol, BullishHarami(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.BearishHarami, sma.Symbol, BearishHarami(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.DarkCloudCover, sma.Symbol, DarkCloudCover(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.OnNeck, sma.Symbol, OnNeck(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.TweezerTop, sma.Symbol, TweezerTop(stockData, sma), exchange, null, msg.Timestamp));
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.TweezerBottom, sma.Symbol, TweezerBottom(stockData, sma), exchange, null, msg.Timestamp));

				// Console.WriteLine("BasicCandle: Symbol: {0}, Alert: {1}", sma.Symbol, JsonSerializer.Serialize(alerts));
				if (alerts.Count > 0)
				{
					// await _alertPublisher.SendAlerts(alerts);
				}

				return alerts;
			}
			catch (Exception e)
			{
				_logger.LogError(e, $"Error message: {msgJson}");
			}

			return null;
		}

		public string Test(Stock stockData, SMAGeneral sma)
		{
			return AlertMessageFormat.Test;
		}

		public string BearishEngulfing(Stock stockData, SMAGeneral sma)
		{
			var last2 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last2 is null || last2.Count < 2)
				return null;
			var cnt = last2.Count;
			if (!CandlePatterns.IsBearishEngulfingCandles(last2[cnt - 2], last2[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last2, 4, 1, cnt - 2))
				return null;

			return AlertMessageFormat.BearishEngulfing;
		}

		public string BullishEngulfing(Stock stockData, SMAGeneral sma)
		{
			var last2 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last2 is null || last2.Count != 2)
				return null;
			var cnt = last2.Count;
			if (!CandlePatterns.IsBullishEngulfingCandles(last2[cnt - 2], last2[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last2, 4, -1, cnt - 2))
				return null;

			return AlertMessageFormat.BullishEngulfing;
		}

		public string Hammer(Stock stockData, SMAGeneral sma)
		{
			var last1 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last1 is null || last1.Count != 1)
				return null;
			var cnt = last1.Count;
			if (!CandlePatterns.IsHammerCandle(last1[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last1, 4, -1, cnt - 1))
				return null;

			return AlertMessageFormat.Hammer;
		}

		public string HangingMan(Stock stockData, SMAGeneral sma)
		{
			var last1 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last1 is null || last1.Count != 1)
				return null;
			var cnt = last1.Count;
			if (!CandlePatterns.IsHammerCandle(last1[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last1, 4, 1, cnt - 1))
				return null;

			return AlertMessageFormat.HangingMan;
		}

		public string InvertedHammer(Stock stockData, SMAGeneral sma)
		{
			var last1 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last1 is null || last1.Count != 1)
				return null;
			var cnt = last1.Count;
			if (!CandlePatterns.IsInvertedHammerCandle(last1[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last1, 4, -1, cnt - 1))
				return null;

			return AlertMessageFormat.InvertedHammer;
		}

		public string ShootingStar(Stock stockData, SMAGeneral sma)
		{
			var last1 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last1 is null || last1.Count != 1)
				return null;
			var cnt = last1.Count;
			if (!CandlePatterns.IsInvertedHammerCandle(last1[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last1, 4, 1, cnt - 1))
				return null;

			return AlertMessageFormat.ShootingStar;
		}

		public string MorningStar(Stock stockData, SMAGeneral sma)
		{
			var last3 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last3 is null || last3.Count != 3)
				return null;
			var cnt = last3.Count;
			if (!CandlePatterns.IsMorningStarCandles(last3[cnt - 3], last3[cnt - 2], last3[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last3, 4, -1, cnt - 3))
				return null;

			return AlertMessageFormat.MorningStar;
		}

		public string EveningStar(Stock stockData, SMAGeneral sma)
		{
			var last3 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last3 is null || last3.Count != 3)
				return null;
			var cnt = last3.Count;
			if (!CandlePatterns.IsEveningStarCandles(last3[cnt - 3], last3[cnt - 2], last3[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last3, 4, 1, cnt - 3))
				return null;

			return AlertMessageFormat.EveningStar;
		}

		public string ThreeWhiteSoldiers(Stock stockData, SMAGeneral sma)
		{
			var last3 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last3 is null || last3.Count != 3)
				return null;
			var cnt = last3.Count;
			if (!CandlePatterns.IsThreeWhiteSoldiersCandles(last3[cnt - 3], last3[cnt - 2], last3[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last3, 4, -1, cnt - 3))
				return null;

			return AlertMessageFormat.ThreeWhiteSoldiers;
		}

		public string ThreeBlackCrows(Stock stockData, SMAGeneral sma)
		{
			var last3 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last3 is null || last3.Count != 3)
				return null;
			var cnt = last3.Count;
			if (!CandlePatterns.IsThreeBlackCrowsCandles(last3[cnt - 3], last3[cnt - 2], last3[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last3, 4, -1, cnt - 3))
				return null;

			return AlertMessageFormat.ThreeBlackCrows;
		}

		public string BullishCounterAttack(Stock stockData, SMAGeneral sma)
		{
			var last2 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last2 is null || last2.Count != 2)
				return null;
			var cnt = last2.Count;
			if (!CandlePatterns.IsBullishCounterAttackCandles(last2[cnt - 2], last2[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last2, 4, -1, cnt - 2))
				return null;

			return AlertMessageFormat.BullishCounterAttack;
		}

		public string BearishCounterAttack(Stock stockData, SMAGeneral sma)
		{
			var last2 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last2 is null || last2.Count != 2)
				return null;
			var cnt = last2.Count;
			if (!CandlePatterns.IsBearishCounterAttackCandles(last2[cnt - 2], last2[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last2, 4, 1, cnt - 2))
				return null;

			return AlertMessageFormat.BearishCounterAttack;
		}

		public string DarkCloudCover(Stock stockData, SMAGeneral sma)
		{
			var last2 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last2 is null || last2.Count != 2)
				return null;
			var cnt = last2.Count;
			if (!CandlePatterns.IsDarkCloudCoverCandles(last2[cnt - 2], last2[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last2, 4, 1, cnt - 2))
				return null;

			return AlertMessageFormat.DarkCloudCover;
		}

		public string BullishHarami(Stock stockData, SMAGeneral sma)
		{
			var last2 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last2 is null || last2.Count != 2)
				return null;
			var cnt = last2.Count;
			if (!CandlePatterns.IsBullishHaramiCandles(last2[cnt - 2], last2[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last2, 4, -1, cnt - 2))
				return null;

			return AlertMessageFormat.BullishHarami;
		}

		public string BearishHarami(Stock stockData, SMAGeneral sma)
		{
			var last2 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last2 is null || last2.Count != 2)
				return null;
			var cnt = last2.Count;
			if (!CandlePatterns.IsBearishHaramiCandles(last2[cnt - 2], last2[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last2, 4, 1, cnt - 2))
				return null;

			return AlertMessageFormat.BearishHarami;
		}

		public string WhiteMarubozu(Stock stockData, SMAGeneral sma)
		{
			var last1 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last1 is null || last1.Count != 1)
				return null;
			var cnt = last1.Count;
			if (!CandlePatterns.IsWhiteMarubozu(last1[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last1, 4, -1, cnt - 1))
				return null;

			return AlertMessageFormat.WhiteMarubozu;
		}

		public string BlackMarubozu(Stock stockData, SMAGeneral sma)
		{
			var last1 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last1 is null || last1.Count != 1)
				return null;
			var cnt = last1.Count;
			if (!CandlePatterns.IsBlackMarubozu(last1[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last1, 4, 1, cnt - 1))
				return null;

			return AlertMessageFormat.BlackMarubozu;
		}

		public string OnNeck(Stock stockData, SMAGeneral sma)
		{
			var last2 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last2 is null || last2.Count != 2)
				return null;
			var cnt = last2.Count;
			if (!CandlePatterns.IsOnNeckCandles(last2[cnt - 2], last2[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last2, 4, -1, cnt - 2))
				return null;

			return AlertMessageFormat.OnNeck;
		}

		public string Piercing(Stock stockData, SMAGeneral sma)
		{
			var last2 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last2 is null || last2.Count != 2)
				return null;
			var cnt = last2.Count;
			if (!CandlePatterns.IsPiercingCandles(last2[cnt - 2], last2[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last2, 4, -1, cnt - 2))
				return null;

			return AlertMessageFormat.Piercing;
		}

		public string TweezerTop(Stock stockData, SMAGeneral sma)
		{
			var last2 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last2 is null || last2.Count != 2)
				return null;
			var cnt = last2.Count;
			if (!CandlePatterns.IsTweezerTopCandles(last2[cnt - 2], last2[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last2, 4, -1, cnt - 2))
				return null;

			return AlertMessageFormat.TweezerTop;
		}

		public string TweezerBottom(Stock stockData, SMAGeneral sma)
		{
			var last2 = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, 10);
			if (last2 is null || last2.Count != 2)
				return null;
			var cnt = last2.Count;
			if (!CandlePatterns.IsTweezerBottomCandles(last2[cnt - 2], last2[cnt - 1])
				|| !CandlePatterns.IsMatchTrend(last2, 4, 1, cnt - 2))
				return null;

			return AlertMessageFormat.TweezerBottom;
		}
	}
}