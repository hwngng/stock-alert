using System.Collections.Generic;
using System.Threading.Tasks;
using CoreIdentity.Data.Models;
using CoreIdentity.Data.ViewModels;

namespace CoreIdentity.Data.Interfaces
{
    public interface IAlertTypeRepo
    {
        Task<IEnumerable<AlertType>> GetAll();
        Task<AlertType> GetDetail(string typeKey);
        Task<int> InsertAlertType(AlertTypeViewModel alertTypeViewModel);
        Task<int> UpdateAlertType(AlertTypeViewModel alertTypeViewModel);
        Task<int> DeleteAlertType(string typeKey);
    }
}