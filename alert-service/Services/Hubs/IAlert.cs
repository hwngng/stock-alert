using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlertService.Services.Models;

namespace AlertService.Services.Hubs
{
    public interface IAlert
    {
        Task ShowTime(DateTime currentTime);
        Task Alert(Alert alert);
        Task Alert(List<Alert> alerts);
    }
}