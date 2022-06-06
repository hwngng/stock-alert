using System.Threading.Tasks;
using AlertService.Models;

namespace AlertService.Interfaces
{
	public interface IDistributeMessage
	{
		Task Distribute(Message message);
	}
}