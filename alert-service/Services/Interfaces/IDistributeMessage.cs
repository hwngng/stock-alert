using System.Threading.Tasks;
using AlertService.Services.Models;

namespace AlertService.Services.Interfaces
{
	public interface IDistributeMessage
	{
		Task Distribute(Message message);
	}
}