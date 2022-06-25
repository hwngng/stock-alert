using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AlertService.Services.Models;
using Microsoft.AspNetCore.SignalR;

namespace AlertService.Services.Hubs
{
	public class AlertHub : Hub<IAlert>
	{
		public async Task SendTimeToClients(DateTime dateTime)
		{
			await Clients.All.ShowTime(dateTime);
		}
		public async Task SendAlert(Alert alert)
		{
			await Clients.All.Alert(alert);
		}
        public async Task SendAlerts(List<Alert> alerts)
		{
            var tasks = alerts.Select(async alert => {
                await Clients.All.Alert(alert);
            });
			await Task.WhenAll(tasks);
		}
	}
}