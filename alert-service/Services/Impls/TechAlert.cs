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
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlertService.Services.Impls
{
	public class TechAlert : BaseAlert
	{
		private JsonSerializerOptions _parseOptions;
		public TechAlert(IConfiguration config,
							ILogger<DataProvider> logger,
							IDataProvider dataProvider,
							AlertPublisher alertPublisher) : base(config, logger, dataProvider, alertPublisher)
		{
			_parseOptions = new JsonSerializerOptions
			{
				Converters = { new NullableConverterFactory() },
				NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString
			};
			_selfManageType = new List<string>
			{
				AlertTypeConstant.MA10Above,
				AlertTypeConstant.MA10Below,
				AlertTypeConstant.MA45Above,
				AlertTypeConstant.MA45Below,
				AlertTypeConstant.RSI14InOverBuy,
				AlertTypeConstant.RSI14InOverSell,
				AlertTypeConstant.RSI14OutOverBuy,
				AlertTypeConstant.RSI14OutOverSell,

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
					// Console.WriteLine(string.Format("Symbol: {3}. Ratio change: {0}. Last value: {1}. Current value: {2}", change, _lastScanPrice[sma.Symbol].MatchPrice.Value, sma.MatchPrice.Value, sma.Symbol));
					if (Math.Abs(change) < _config.GetValue<decimal>("ScanRatio"))
					{
						return;
					}
				}
				_lastScanPrice[sma.Symbol] = sma;
				var stockData = await _dataProvider.GetLatestStockData(sma.Symbol);
				var exchange = (await _dataProvider.GetLatestStockInfo(sma.Symbol)).ExchangeCode;

				var alerts = new List<Alert>();

				addAlertIfNotNull(alerts, SMA(stockData, sma, 10));
				addAlertIfNotNull(alerts, SMA(stockData, sma, 45));
				addAlertIfNotNull(alerts, RSI(stockData, sma, 14));

				Console.WriteLine("TechAlert: Symbol: {0}, Alert: {1}", sma.Symbol, JsonSerializer.Serialize(alerts));
				if (alerts.Count > 0)
				{
					await _alertPublisher.SendAlerts(alerts);
				}
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error ");
			}
		}

		public Alert SMA(Stock stockData, SMAGeneral sma, int period)
		{
			Alert alert = null;

			var lastPeriod = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, period);
			var smaIndicator = Indicator.GetSMA(lastPeriod, period);
			switch (period)
			{
				case 10:
				case 45:
					var currentIndicator = smaIndicator.Points.LastOrDefault();
					if (sma.MatchPrice > currentIndicator?.Value)
					{
						alert = CreateAlert(AlertTypeConstant.MA10Above,
											stockData.Symbol,
											string.Format(AlertMessageFormat.MA, "lên", period),
											stockData.ExchangeCode);
					}
					else if (sma.MatchPrice < currentIndicator?.Value)
					{
						alert = CreateAlert(AlertTypeConstant.MA10Above,
											stockData.Symbol,
											string.Format(AlertMessageFormat.MA, "xuống", period),
											stockData.ExchangeCode);
					}
					break;
			}

			return alert;
		}

		public Alert RSI(Stock stockData, SMAGeneral sma, int period)
		{
			Alert alert = null;

			var lastPeriod = Utils.GetLastNTradingDay(stockData.HistoricalPrice, sma, period + 2);
			var rsiIndicator = Indicator.GetRSI(lastPeriod, period);
			if (rsiIndicator.Points.Count < 2)
				return alert;
			switch (period)
			{
				case 14:
					var currentPoint = rsiIndicator.Points.LastOrDefault();
					var prevPoint = rsiIndicator.Points[rsiIndicator.Points.Count - 2];
					if (currentPoint.Value > 70 && prevPoint.Value < 70)
					{
						alert = CreateAlert(AlertTypeConstant.RSI14InOverBuy,
											stockData.Symbol,
											string.Format(AlertMessageFormat.RSI, period, "đi vào", "mua"),
											stockData.ExchangeCode);
					}
					else if (currentPoint.Value < 70 && prevPoint.Value > 70)
					{
						alert = CreateAlert(AlertTypeConstant.RSI14InOverBuy,
											stockData.Symbol,
											string.Format(AlertMessageFormat.RSI, period, "đi ra", "mua"),
											stockData.ExchangeCode);
					}
					else if (currentPoint.Value < 30 && prevPoint.Value > 30)
					{
						alert = CreateAlert(AlertTypeConstant.RSI14InOverBuy,
											stockData.Symbol,
											string.Format(AlertMessageFormat.RSI, period, "đi vào", "bán"),
											stockData.ExchangeCode);
					}
					else if (currentPoint.Value > 30 && prevPoint.Value < 30)
					{
						alert = CreateAlert(AlertTypeConstant.RSI14InOverBuy,
											stockData.Symbol,
											string.Format(AlertMessageFormat.RSI, period, "đi ra", "bán"),
											stockData.ExchangeCode);
					}
					break;
			}

			return alert;
		}
	}
}