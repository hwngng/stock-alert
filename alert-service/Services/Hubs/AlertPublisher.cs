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
		private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, AlertOption>> _clientSettings;
		private readonly AlertFilterService _alertFilterService;
		public AlertPublisher(IHubContext<AlertHub, IAlert> alertHub, AlertFilterService alertFilterService)
		{
			_alertHub = alertHub;
			_alertFilterService = alertFilterService;
			_clientSettings = new ConcurrentDictionary<string, ConcurrentDictionary<string, AlertOption>>();
		}

		public async Task SendAlerts(List<Alert> alerts)
		{
			foreach (var alert in alerts)
			{
				await Task.Run(async () =>
				{
					foreach (var settingPair in _clientSettings)
					{
						if (!settingPair.Value.ContainsKey(alert.Type))
						{
							continue;
						}
						var alertOption = settingPair.Value[alert.Type];
						if (!(await _alertFilterService.CanAlert(alert, alertOption)))
						{
							continue;
						}
						await _alertHub.Clients.Client(settingPair.Key).Alert(alert);
					}
				});
			}
		}

		public async Task SendAlerts(List<Alert> alerts, HubCallerContext context)
		{
			foreach (var alert in alerts)
			{
				await Task.Run(async () =>
				{
					var setting = _clientSettings[context.ConnectionId];
					if (!setting.ContainsKey(alert.Type))
					{
						return; ;
					}
					var alertOption = setting[alert.Type];
					if (!(await _alertFilterService.CanAlert(alert, alertOption)))
					{
						return;
					}
					await _alertHub.Clients.Client(context.ConnectionId).Alert(alert);
				});
			}
		}

		public void UpdateFilter(HubCallerContext context, List<AlertOption> alertOptions)
		{
			if (!_clientSettings.ContainsKey(context.ConnectionId))
				_clientSettings[context.ConnectionId] = new ConcurrentDictionary<string, AlertOption>();
			foreach (var alertOption in alertOptions)
			{
				_clientSettings[context.ConnectionId][alertOption.TypeKey] = alertOption;
			}
            Console.WriteLine("_clientSettings: " + JsonSerializer.Serialize(_clientSettings));
		}

		public void RemoveFilter(HubCallerContext context)
		{
			_clientSettings[context.ConnectionId] = new ConcurrentDictionary<string, AlertOption>();
		}

		public void RemoveConnection(HubCallerContext context)
		{
			_clientSettings.Remove(context.ConnectionId, out _);
		}
	}
}