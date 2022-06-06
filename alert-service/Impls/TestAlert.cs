using System;
using System.Threading.Tasks;
using AlertService.Interfaces;
using AlertService.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace AlertService.Impls
{
    public class TestAlert: IHandleMessage
    {
        private readonly ILogger<TestAlert> _logger;

        public TestAlert (ILogger<TestAlert> logger) {
            _logger = logger;
        }

        public async Task ProcessMessage (SocketMessage socketMessage) {
            try {
            // var t = new Task(() => {
                var realType = socketMessage.Message.GetType();
                _logger.LogInformation("From TestAlert 1 ({time}): {msg}", DateTimeOffset.Now, JsonSerializer.Serialize(Convert.ChangeType(socketMessage.Message, realType)));
                await Task.Delay((new Random().Next())%10000+1000);
            } catch (Exception e) {
                _logger.LogWarning(e, "From TestAlert 1: ");
            }
            // });
            // return t;
        }
    }
}