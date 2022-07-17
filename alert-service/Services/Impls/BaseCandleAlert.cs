using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlertService.Services.Hubs;
using AlertService.Services.Interfaces;
using AlertService.Services.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlertService.Services.Impls
{
	public abstract class BaseCandleAlert : IHandleMessage
	{
		protected readonly IConfiguration _config;
		protected readonly ILogger<DataProvider> _logger;
		protected readonly IDataProvider _dataProvider;
		protected readonly Dictionary<string, SMAGeneral> _lastScanPrice;
		protected readonly IHubContext<AlertHub, IAlert> _alertHub;

		public BaseCandleAlert(IConfiguration config,
								ILogger<DataProvider> logger,
								IDataProvider dataProvider,
								IHubContext<AlertHub, IAlert> alertHub)
		{
			_config = config;
			_logger = logger;
			_dataProvider = dataProvider;
			_lastScanPrice = new Dictionary<string, SMAGeneral>();
			_alertHub = alertHub;
		}

		public abstract Task ProcessMessage(SocketMessage msg);

		protected List<OHLCV> getLastNTradingDay(List<OHLCV> ohlcs, SMAGeneral sma, int n)
		{
			if (n > ohlcs.Count)
				n = ohlcs.Count;
			var from = ohlcs.Count - n >= 0 ? ohlcs.Count - n : 0;
			if (sma is null)
			{
				return ohlcs.GetRange(from, n);
			}
			var last = ohlcs[ohlcs.Count - 1];
			OHLCV currentOhlc = null;
			if (last.Date.Date == DateTime.UtcNow.Date)
			{       // take open price
				currentOhlc = last.CreateCopy();
			}
			else
			{
				currentOhlc = new OHLCV();
				currentOhlc.Open = sma.MatchPrice.Value;
			}
			currentOhlc.Close = sma.MatchPrice.Value;
			currentOhlc.High = sma.DayHigh.Value;
			currentOhlc.Low = sma.DayLow.Value;
			currentOhlc.Volume = sma.AccumulatedVol.Value;


			var lastN = ohlcs.GetRange(from, n - 1);
			lastN.Add(currentOhlc);

			return lastN;
		}

		protected void addAlertIfNotNull(List<Alert> alerts, Alert added)
		{
			if (!(added is null))
				alerts.Add(added);
		}

		protected void addAlertIfNotNull(List<Alert> alerts, List<Alert> added)
		{
			if (!(added is null))
				alerts.AddRange(added);
		}

		public Alert CreateAlert(string type, string symbol, string message, string exchange = null, object description = null)
		{
			return string.IsNullOrEmpty(message) ?
					null
					: new Alert
					{
						Type = type,
						Symbol = symbol,
						Message = message,
						Exchange = exchange,
						Description = description,
						PublishedAt = DateTime.UtcNow
					};
		}
	}
}