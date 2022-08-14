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
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlertService.Services.Impls
{
	public class ComplexCandle : BaseCandleAlert
	{
		private JsonSerializerOptions _parseOptions;
		private decimal _scanRatio;
		public ComplexCandle(IConfiguration config,
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
				AlertTypeConstant.CupWithHandle
			};
			_scanRatio = _config.GetValue<decimal>("ScanRatio");
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
					if (Math.Abs(change) < _scanRatio)
					{
						return null;
					}
					Console.WriteLine(string.Format("Symbol: {3}. Ratio change: {0}. Scan ratio: {3}. Last value: {1}. Current value: {2}", change, _lastScanPrice[sma.Symbol].MatchPrice.Value, sma.MatchPrice.Value, _scanRatio));
				}
				_lastScanPrice[sma.Symbol] = sma;
				var stockData = await _dataProvider.GetLatestStockData(sma.Symbol);
				var exchange = (await _dataProvider.GetLatestStockInfo(sma.Symbol)).ExchangeCode;

				var alerts = new List<Alert>();

				// var ret1 = GetAllCupWithHandle(stockData, sma);
				var ret1 = CupWithHandle(stockData, sma);
				addAlertIfNotNull(alerts, CreateAlert(AlertTypeConstant.CupWithHandle, sma.Symbol, ret1.message, exchange, ret1.cwhs, msg.Timestamp));

				// Console.WriteLine("ComplexCandle: Symbol: {0}, Alert: {1}", sma.Symbol, JsonSerializer.Serialize(alerts));
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

		public (string message, object cwhs) GetAllCupWithHandle(Stock stockData, SMAGeneral sma, int range = 280)
		{
			var lastRange = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, range);
			var sma1 = Indicator.GetSMA(lastRange, 1);
			var cwhs = new List<CupWithHandle>();

			for (var i = sma1.Points.Count - 1; i > 5 * 5; --i)     // 8 week
			{
				var cwh = CandlePatterns.GetNearestCupWithHandle(sma1, i);
				if (cwh is null)
					continue;
				cwhs.Add(cwh);
				i = cwh.DipIndex;
			}

			string message = cwhs.Count > 0 ? AlertMessageFormat.CupWithHandle : null;
			return (message, cwhs);
		}

		public (string message, object cwhs) CupWithHandle(Stock stockData, SMAGeneral sma, int range = 280)
		{
			var lastRange = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, range);
			var sma1 = Indicator.GetSMA(lastRange, 1);
			var cwh = CandlePatterns.GetNearestCupWithHandle(sma1, sma1.Points.Count - 1);

			string message = cwh is null ? null : AlertMessageFormat.CupWithHandle;
			return (message, cwh);
		}
	}
}