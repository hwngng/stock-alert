using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AlertService.Models;
using AlertService.Services.Interfaces;
using AlertService.Services.Models;
using Microsoft.AspNetCore.SignalR;

namespace AlertService.Services.Hubs
{
	public class AlertHandler
	{
		private readonly IEnumerable<IAlertProvider> _alertProviders;
		private readonly AlertPublisher _alertPublisher;
		private readonly IDataProvider _dataProvider;
		public AlertHandler(IEnumerable<IAlertProvider> alertProviders, AlertPublisher alertPublisher, IDataProvider dataProvider)
		{
			_alertProviders = alertProviders;
			_alertPublisher = alertPublisher;
			_dataProvider = dataProvider;
		}

		public async Task SubscribeAlerts(HubCallerContext context, List<AlertOption> alertOptions)
		{
			_alertPublisher.UpdateFilter(context, alertOptions);
			var aggAlerts = new List<Alert>();
			foreach (var alertOption in alertOptions)
			{
				foreach (var alertProvider in _alertProviders)
				{
					var symbols = alertOption.Symbols?.Select(x => x.Symbol);
					if (symbols is null && !string.IsNullOrEmpty(alertOption.Exchange))
					{
						var exchanges = alertOption.Exchange.Split(',').ToList();
						var stockInfos = await _dataProvider.GetLatestStockInfoByExchange(exchanges);
						symbols = stockInfos.Select(x => x.Symbol);
					}
					else if (symbols is null)
					{
						continue;
					}
					var alerts = alertProvider.GetLatestAlerts(symbols.ToList(), alertOption.TypeKey);
					var alerts2 = new List<Alert>();
					if (!string.IsNullOrEmpty(alertOption.TypeKey2))
					{
						alerts2 = alertProvider.GetLatestAlerts(symbols.ToList(), alertOption.TypeKey2);
					}
					aggAlerts.AddRange(alerts);
					aggAlerts.AddRange(alerts2);
				}
			}
			aggAlerts = aggAlerts.GroupBy(x => new { x.Type, x.Symbol, x.Exchange }).Select(g => g.First()).ToList();
			// Console.WriteLine("aggAlerts: " + JsonSerializer.Serialize(aggAlerts));
			await Task.Run(() => _alertPublisher.SendAlerts(aggAlerts, context));
		}

		public async Task UnsubscribeAlerts(HubCallerContext context, List<AlertOption> alertOptions)
		{
			_alertPublisher.RemoveFilter(context, alertOptions);
		}

		public async Task UserDisconnect(HubCallerContext context)
		{
			_alertPublisher.RemoveConnection(context);
		}
	}
}