using System;
using System.Threading.Tasks;
using AlertService.Models;

namespace AlertService.Interfaces
{
    public interface IHandleMessage
    {
        Task ProcessMessage (SocketMessage msg);
    }
}