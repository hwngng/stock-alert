using Microsoft.AspNetCore.Mvc;

namespace CoreIdentity.API.Controllers
{
	public abstract class BaseController : Controller
	{
		protected BaseController() { }
        protected IActionResult Forbidden(string message)
        {
            return new ObjectResult(message) { StatusCode = 403 };
        }
        protected IActionResult Forbidden()
        {
            return new ObjectResult("") { StatusCode = 403 };
        }
	}
}