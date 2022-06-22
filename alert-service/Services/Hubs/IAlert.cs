using System;
using System.Threading.Tasks;
using AlertService.Services.Models;

namespace AlertService.Services.Hubs
{
    public interface IAlert
    {
        Task ShowTime(DateTime currentTime);
        Task Alert(Alert alert);
    }
}