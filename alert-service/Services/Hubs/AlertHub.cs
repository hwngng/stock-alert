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
	public class AlertHub : Hub<IAlert>
	{
		private readonly AlertHandler _alertHandler;
		public AlertHub(AlertHandler alertHandler)
		{
			_alertHandler = alertHandler;
		}
		public async Task SendTimeToClients(DateTime dateTime)
		{
			await Clients.All.ShowTime(dateTime);
		}
		public async Task SendAlert(Alert alert)
		{
			await Clients.All.Alert(alert);
		}
		public async Task SubscribeAlerts(List<AlertOption> alertOptions)
		{
			await _alertHandler.SubscribeAlerts(Context, alertOptions);
		}

		public async Task UnsubscribeAlerts(List<AlertOption> alertOptions)
		{
			await _alertHandler.UnsubscribeAlerts(Context, alertOptions);
		}

		public override async Task OnDisconnectedAsync(Exception e)
		{
			await _alertHandler.UserDisconnect(Context);
		}
	}
}