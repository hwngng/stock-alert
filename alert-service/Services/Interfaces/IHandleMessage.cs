using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlertService.Services.Models;

namespace AlertService.Services.Interfaces
{
    public interface IHandleMessage
    {
        Task<List<Alert>> ProcessMessage (SocketMessage msg);
    }
}