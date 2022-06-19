using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace AlertService.Services.Interfaces
{
    public interface IWebSocketHub
    {
        Task Connect ();
        Task Disconnect ();
        Task StartFetchMessage (CancellationToken cancellationToken);
        Task SubscribeStock (List<string> codes);
    }
}