using System.Collections.Generic;
using AlertService.Services.Models;

namespace AlertService.Services.Interfaces
{
    public interface IAlertProvider
    {
        List<Alert> GetLatestAlerts (List<string> symbols);
        List<Alert> GetLatestAlerts(List<string> symbols, string typeKey);
    }
}