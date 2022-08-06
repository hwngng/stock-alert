using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AlertService.Services.Common;
using AlertService.Services.Hubs;
using AlertService.Services.Interfaces;
using AlertService.Services.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlertService.Services
{
	public class DistributeMessage : IDistributeMessage
	{
		private readonly IConfiguration _config;
		private readonly ILogger<DataProvider> _loggger;
		private readonly IEnumerable<IHandleMessage> _messageHandlers;
		private readonly AlertPublisher _alertPublisher;
        private static long _messageCount = 0;

		public DistributeMessage(IConfiguration config, ILogger<DataProvider> logger, IEnumerable<IHandleMessage> messageHandlers, AlertPublisher alertPublisher)
		{
			_config = config;
			_loggger = logger;
            _messageHandlers = messageHandlers;
			_alertPublisher = alertPublisher;
		}

        // accumulate message by percent change and change with MQ
		public async Task Distribute(Message message)
		{
			var socketMsg = new SocketMessage {
                Message = message,
                Timestamp = Utils.GetEpochTimeSec(DateTime.UtcNow)
            };

			var tasks = _messageHandlers.Select(async  handler => {
				return await handler.ProcessMessage(socketMsg);
			});

			var alertsAgg = new List<Alert>();
			var alertsList = await Task.WhenAll(tasks);
			foreach(var alerts in alertsList)
			{
				if (alerts != null)
					alertsAgg.AddRange(alerts);
			}

			await Task.Run(() => _alertPublisher.SendAlerts(alertsAgg));

			// foreach(var messageHandler in _messageHandlers) {
			// 	await Task.Run(() => messageHandler.ProcessMessage(socketMsg));
			// }
		}
	}
}