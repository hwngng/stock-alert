using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
        private static long _messageCount = 0;

		public DistributeMessage(IConfiguration config, ILogger<DataProvider> logger, IEnumerable<IHandleMessage> messageHandlers)
		{
			_config = config;
			_loggger = logger;
            _messageHandlers = messageHandlers;
		}

        // accumulate message by percent change and change with MQ
		public async Task Distribute(Message message)
		{
			var socketMsg = new SocketMessage {
                Message = message,
                Timestamp = _messageCount += 1
            };
			var tasks = _messageHandlers.Select(async handler => {
				await handler.ProcessMessage(socketMsg);
			});
			await Task.WhenAll(tasks);
		}
	}
}