using System;
using System.Threading.Tasks;
using AlertService.Services.Models;

namespace AlertService.Services.Interfaces
{
    public interface IHandleMessage
    {
        Task ProcessMessage (SocketMessage msg);
    }
}