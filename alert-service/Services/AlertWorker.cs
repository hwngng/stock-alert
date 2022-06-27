using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using AlertService.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using AlertService.Services.Hubs;
using System.Text.Json;
using AlertService.Services.Settings;

namespace AlertService.Services
{
	public class AlertWorker : BackgroundService
	{
		private readonly ILogger<AlertWorker> _logger;
		private readonly IConfiguration _config;
		private readonly IWebSocketHub _webSocketHub;
		private readonly IDataProvider _dataProvider;
		private readonly IHubContext<AlertHub, IAlert> _alertHub;
		private readonly WebSocketSettings _ws;


		public AlertWorker(ILogger<AlertWorker> logger,
					IConfiguration config,
					IWebSocketHub webSocketHub,
					IDataProvider dataProvider,
					IHubContext<AlertHub, IAlert> alertHub,
					WebSocketSettings ws)
		{
			_logger = logger;
			_config = config;
			_webSocketHub = webSocketHub;
			_dataProvider = dataProvider;
			_alertHub = alertHub;
			_ws = ws;
		}

		protected override async Task ExecuteAsync(CancellationToken stoppingToken)
		{
			while (!stoppingToken.IsCancellationRequested)
			{
				try
				{
					_logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
					// var res = await _dataProvider.GetLatestStockData("SSI");
					// _logger.LogInformation(JsonSerializer.Serialize(res));
					await _webSocketHub.Connect();
					await _webSocketHub.SubscribeStock(_ws.SubStocks);
					await _webSocketHub.StartFetchMessage(stoppingToken);
					await _webSocketHub.Disconnect();
					await Task.Delay(3000);
				}
				catch (Exception e)
				{
					_logger.LogError(e, "Error ");
				}
			}
		}
	}
}
