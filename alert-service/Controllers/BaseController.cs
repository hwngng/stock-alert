using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AlertService.Controllers
{
    public class BaseController : Controller
    {
        protected readonly ILogger<BaseController> _logger;
        public BaseController(ILogger<BaseController> logger)
        {
            _logger = logger;
        }
    }
}