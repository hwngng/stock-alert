using System;
using System.Threading.Tasks;
using AlertService.Services.Interfaces;
using AlertService.Services.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using AlertService.Services.Hubs;
using System.Collections.Generic;

namespace AlertService.Services.Impls
{
	public class TestAlert : IHandleMessage
	{
		private readonly ILogger<TestAlert> _logger;
		private readonly IHubContext<AlertHub, IAlert> _alertHub;

		public TestAlert(ILogger<TestAlert> logger,
						IHubContext<AlertHub, IAlert> alertHub)
		{
			_logger = logger;
			_alertHub = alertHub;
		}

		public async Task<List<Alert>> ProcessMessage(SocketMessage socketMessage)
		{
			try
			{
				// var t = new Task(() => {
				var realType = socketMessage.Message.GetType();
				_logger.LogInformation("From TestAlert 1 ({time}): {msg}", DateTimeOffset.Now, JsonSerializer.Serialize(Convert.ChangeType(socketMessage.Message, realType)));
				var alert = new Alert();
				alert.Symbol = "Test";
				alert.Message = JsonSerializer.Serialize(Convert.ChangeType(socketMessage.Message, realType));
				alert.PublishedAt = DateTime.UtcNow;
				// await _alertHub.Clients.All.Alert(alert);
				// await Task.Delay((new Random().Next())%10000+1000);
				return new List<Alert>() { alert };
			}
			catch (Exception e)
			{
				_logger.LogWarning(e, "From TestAlert 1: ");
			}
			// });
			// return t;
            return null;
		}
	}
}