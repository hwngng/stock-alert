using System.Security.Claims;
using CoreIdentity.API.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace CoreIdentity.API.Controllers
{
	[Authorize(AuthenticationSchemes = "Bearer")]
	public class AuthorizedController : BaseController
	{
        protected readonly SessionContext _sessionContext;
        protected readonly IHttpContextAccessor _contextAccessor;
		protected AuthorizedController(IHttpContextAccessor contextAccessor)
		{
            this._contextAccessor = contextAccessor;
			this._sessionContext = SessionContext.ResolveContext(contextAccessor.HttpContext);
		}
	}
}