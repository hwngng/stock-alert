using System;
using System.Collections.Generic;
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
	public abstract class BaseAlert : IHandleMessage, IAlertProvider
	{
		protected readonly IConfiguration _config;
		protected readonly ILogger<DataProvider> _logger;
		protected readonly IDataProvider _dataProvider;
		protected readonly Dictionary<string, SMAGeneral> _lastScanPrice;
		protected readonly AlertPublisher _alertPublisher;
		protected readonly Dictionary<string, Dictionary<string, Alert>> _latestAlerts;     // save latest alert for each symbol and each type key
		protected List<string> _selfManageType;
		private readonly IDistributedCache _cache;
		public BaseAlert(IConfiguration config,
								ILogger<DataProvider> logger,
								IDataProvider dataProvider,
								AlertPublisher alertPublisher,
								IDistributedCache cache)
		{
			_config = config;
			_logger = logger;
			_dataProvider = dataProvider;
			_lastScanPrice = new Dictionary<string, SMAGeneral>();
			_alertPublisher = alertPublisher;
			_cache = cache;
			_latestAlerts = new Dictionary<string, Dictionary<string, Alert>>();
		}

		public abstract Task<List<Alert>> ProcessMessage(SocketMessage msg);

		protected void addAlertIfNotNull(List<Alert> alerts, Alert added)
		{
			if (added is null)
				return;
			alerts.Add(added);
			if (!_latestAlerts.ContainsKey(added.Symbol))
			{
				_latestAlerts[added.Symbol] = new Dictionary<string, Alert>();
			}
			_latestAlerts[added.Symbol][added.Type] = added;
		}

		protected void addAlertIfNotNull(List<Alert> alerts, List<Alert> addeds)
		{
			if (addeds is null)
				return;
			alerts.AddRange(addeds);
			foreach (var added in addeds)
			{
				if (!_latestAlerts.ContainsKey(added.Symbol))
				{
					_latestAlerts[added.Symbol] = new Dictionary<string, Alert>();
				}
				_latestAlerts[added.Symbol][added.Type] = added;
			}
		}

		protected Alert CreateAlert(string type, string symbol, string message, string exchange = null, object description = null, long messageTimestamp = 0)
		{
			var alert = string.IsNullOrEmpty(message) ?
					null
					: new Alert
					{
						Type = type,
						Symbol = symbol,
						Message = message,
						Exchange = exchange,
						Description = description,
						PublishedAt = DateTime.UtcNow,
						MessageTimestamp = messageTimestamp
					};
			if (alert is null)
				return alert;

			if (!_latestAlerts.ContainsKey(symbol))
			{
				_latestAlerts[symbol] = new Dictionary<string, Alert>();

			}
			_latestAlerts[symbol][type] = alert;

			return alert;
		}

		public virtual List<Alert> GetLatestAlerts(List<string> symbols)
		{
			var alerts = new List<Alert>();
			foreach (var symbol in symbols)
			{
				if (!_latestAlerts.ContainsKey(symbol))
				{
					continue;
				}
				var symbolAlerts = _latestAlerts[symbol];
				if (symbolAlerts is null)
					continue;
				alerts.AddRange(symbolAlerts.Values);
			}

			return alerts;
		}

		public virtual List<Alert> GetLatestAlerts(List<string> symbols, string typeKey)
		{
			var alerts = new List<Alert>();
			if (_selfManageType.Contains(typeKey))
			{
				foreach (var symbol in symbols)
				{
					if (!_latestAlerts.ContainsKey(symbol))
					{
						continue;
					}
					var symbolAlerts = _latestAlerts[symbol];
					if (symbolAlerts is null || !symbolAlerts.ContainsKey(typeKey))
					{
						continue;
					}
					addAlertIfNotNull(alerts, symbolAlerts[typeKey]);
				}
			}
			// Console.WriteLine("latest alert: " + JsonSerializer.Serialize(_latestAlerts));
			return alerts;
		}
	}
}