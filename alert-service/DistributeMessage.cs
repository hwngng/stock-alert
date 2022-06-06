using System.Collections.Generic;
using System.Threading.Tasks;
using AlertService.Interfaces;
using AlertService.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlertService
{
	public class DistributeMessage : IDistributeMessage
	{
		private readonly IConfiguration _config;
		private readonly ILogger<DataHub> _loggger;
		private readonly IEnumerable<IHandleMessage> _messageHandlers;
        private static long _messageCount = 0;

		public DistributeMessage(IConfiguration config, ILogger<DataHub> logger, IEnumerable<IHandleMessage> messageHandlers)
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
            foreach (var handler in _messageHandlers)
            {
                await handler.ProcessMessage(socketMsg);
            }
		}
	}
}