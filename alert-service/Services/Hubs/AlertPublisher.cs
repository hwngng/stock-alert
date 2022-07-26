using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using AlertService.Models;
using AlertService.Services.Models;
using Microsoft.AspNetCore.SignalR;

namespace AlertService.Services.Hubs
{
	public class AlertPublisher
	{
		private readonly IHubContext<AlertHub, IAlert> _alertHub;
		private readonly ConcurrentDictionary<string, List<AlertOption>> _clientSettings;
		private readonly AlertFilterService _alertFilterService;
		public AlertPublisher(IHubContext<AlertHub, IAlert> alertHub, AlertFilterService alertFilterService)
		{
			_alertHub = alertHub;
			_alertFilterService = alertFilterService;
			_clientSettings = new ConcurrentDictionary<string, List<AlertOption>>();
		}

		public async Task SendAlerts(List<Alert> alerts)
		{
			await Task.Run(async () =>
			{
				foreach (var clientSetting in _clientSettings)
				{
					var alertOptions = clientSetting.Value;
					foreach (var alertOption in alertOptions)
					{
						var satisfiedAlerts = await _alertFilterService.GetAlertsSatisfyOption(alerts, alertOption);
						// Console.WriteLine("SatisfiedAlerts count: {0}", satisfiedAlerts.Count);
						foreach (var alert in satisfiedAlerts)
						{
							await _alertHub.Clients.Client(clientSetting.Key).Alert(alert);
						}
					}

				}
			});
		}

		public async Task SendAlerts(List<Alert> alerts, HubCallerContext context)
		{
			await Task.Run(async () =>
			{
				var alertOptions = _clientSettings[context.ConnectionId];
				foreach (var alertOption in alertOptions)
				{
					var satisfiedAlerts = await _alertFilterService.GetAlertsSatisfyOption(alerts, alertOption);
					foreach (var alert in satisfiedAlerts)
					{
						await _alertHub.Clients.Client(context.ConnectionId).Alert(alert);
					}
				}
			});
		}

		public void UpdateFilter(HubCallerContext context, List<AlertOption> alertOptions)
		{
			if (!_clientSettings.ContainsKey(context.ConnectionId))
				_clientSettings[context.ConnectionId] = new List<AlertOption>();
			_clientSettings[context.ConnectionId].AddRange(alertOptions);
			Console.WriteLine("_clientSettings: " + JsonSerializer.Serialize(_clientSettings));
		}

		public void RemoveFilter(HubCallerContext context, List<AlertOption> alertOptions)
		{
			// _clientSettings[context.ConnectionId] = new ConcurrentDictionary<string, AlertOption>();
		}

		public void RemoveConnection(HubCallerContext context)
		{
			_clientSettings.Remove(context.ConnectionId, out _);
		}
	}
}