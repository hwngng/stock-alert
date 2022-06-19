using System;
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

	}
}