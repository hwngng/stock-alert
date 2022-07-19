using System.Collections.Generic;
using System.Threading.Tasks;
using CoreIdentity.Data.Models;
using CoreIdentity.Data.ViewModels;

namespace CoreIdentity.Data.Interfaces
{
	public interface IAlertOptionRepo
	{
		Task<IEnumerable<AlertOptionViewModel>> GetByUserId(long userId);
		Task<AlertOptionViewModel> GetDetailById(long userId, long id);
		Task<(int Status, long Id)> InsertAlertOption(long userId, AlertOptionViewModel alertOptionViewModel);
		Task<int> UpdateAlertOption(long userId, AlertOptionViewModel alertOptionViewModel);
		Task<int> DeleteAlertOption(long userId, long id);
	}
}