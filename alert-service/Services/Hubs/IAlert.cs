using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlertService.Models;
using AlertService.Services.Models;

namespace AlertService.Services.Hubs
{
    public interface IAlert
    {
        Task ShowTime(DateTime currentTime);
        Task Alert(Alert alert);
        Task Alert(List<Alert> alerts);
        Task SubscribeAlert(AlertOption alertOption);
        Task SubscribeAlerts(List<AlertOption> alertOptions);
    }
}