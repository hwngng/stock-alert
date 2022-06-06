using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace CoreIdentity.API.Controllers
{
    [Produces("application/json")]
    [Route("api")]
    public class PingController : BaseController
    {
        [HttpGet]
        [Route("ping")]
        public IActionResult Ping ()
        {
            return Ok("pong");
        }
    }
}