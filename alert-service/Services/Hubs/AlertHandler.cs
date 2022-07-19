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
					aggAlerts.AddRange(alerts);
				}
			}
			Console.WriteLine("aggAlerts: " + JsonSerializer.Serialize(aggAlerts));
			await Task.Run(() => _alertPublisher.SendAlerts(aggAlerts, context));
		}

		public async Task UnsubscribeAlerts(HubCallerContext context, List<AlertOption> alertOptions)
		{
			_alertPublisher.RemoveFilter(context);
		}

		public async Task UserDisconnect(HubCallerContext context)
		{
			_alertPublisher.RemoveConnection(context);
		}
	}
}