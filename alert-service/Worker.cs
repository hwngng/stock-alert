using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Net.WebSockets;
using AlertService.Interfaces;
using AlertService.Impls;

namespace AlertService
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly IConfiguration _config;
        private readonly IWebSocketHub _webSocketHub;
        private readonly IDataHub _dataHub;

        public Worker(ILogger<Worker> logger, IConfiguration config, IWebSocketHub webSocketHub, IDataHub dataHub)
        {
            _logger = logger;
            _config = config;
            _webSocketHub = webSocketHub;
            _dataHub = dataHub;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
                await _dataHub.GetMultiHistoricalPrice(new List<string> {"MBB", "THD"}, new DateTime(2022, 5, 10));
                await _webSocketHub.Connect();
                await _webSocketHub.SubscribeStock(_config.GetSection("WebSocket:Stocks").Get<List<string>>());
                await _webSocketHub.StartFetchMessage(stoppingToken);
                await _webSocketHub.Disconnect();
                await Task.Delay(3000);
            }
        }
    }
}
