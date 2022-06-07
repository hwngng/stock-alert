using System.Security.Authentication;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace CoreIdentity.API.Common
{
	public class SessionContext
	{
		public long UserLocalId { get; set; }
		public string UserName { get; set; }
		public string Id { get; set; }
		public static SessionContext ResolveContext(HttpContext httpContext)
		{
			var sessionContext = new SessionContext();
			var claims = httpContext.User.Identity as ClaimsIdentity;
			var strLid = claims?.FindFirst("lid")?.Value;
			var name = claims?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			var id = claims?.FindFirst("uid")?.Value;
			if (string.IsNullOrEmpty(strLid)
				|| string.IsNullOrEmpty(name)
				|| string.IsNullOrEmpty(id)) {
					throw new AuthenticationException();
				}
			return new SessionContext {
				UserName = name,
				UserLocalId = long.Parse(strLid),
				Id = id
			};
		}
	}
}