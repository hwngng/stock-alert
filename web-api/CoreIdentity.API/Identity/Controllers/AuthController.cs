using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using CoreIdentity.API.Helpers;
using CoreIdentity.API.Identity.ViewModels;
using CoreIdentity.API.Services;
using CoreIdentity.API.Settings;
using Microsoft.Extensions.Options;
using CoreIdentity.API.Identity.Models;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using CoreIdentity.API.Common;
using CoreIdentity.API.Identity.Interfaces;

namespace CoreIdentity.API.Identity.Controllers
{
	[Produces("application/json")]
	[Route("api/auth")]
	public class AuthController : Controller
	{
		private readonly UserManager<ApplicationUser> _userManager;
		private readonly RoleManager<IdentityRole> _roleManager;
		private readonly IRefreshTokenRepo _repo;
		private readonly IConfiguration _configuration;
		private readonly IEmailService _emailService;
		private readonly ClientAppSettings _client;
		private readonly JwtSecurityTokenSettings _jwt;

		public AuthController(
			UserManager<ApplicationUser> userManager,
			RoleManager<IdentityRole> roleManager,
			IConfiguration configuration,
			IEmailService emailService,
			IOptions<ClientAppSettings> client,
			IOptions<JwtSecurityTokenSettings> jwt,
			IRefreshTokenRepo repo
			)
		{
			this._userManager = userManager;
			this._roleManager = roleManager;
			this._configuration = configuration;
			this._emailService = emailService;
			this._client = client.Value;
			this._jwt = jwt.Value;
			this._repo = repo;
		}

		/// <summary>
		/// Confirms a user email address
		/// </summary>
		/// <param name="model">ConfirmEmailViewModel</param>
		/// <returns></returns>
		[HttpPost]
		[ProducesResponseType(typeof(IdentityResult), 200)]
		[ProducesResponseType(typeof(IEnumerable<string>), 400)]
		[Route("confirmEmail")]
		public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailViewModel model)
		{

			if (model.UserId == null || model.Code == null)
			{
				return BadRequest(new string[] { "Error retrieving information!" });
			}

			var user = await _userManager.FindByIdAsync(model.UserId).ConfigureAwait(false);
			if (user == null)
				return BadRequest(new string[] { "Could not find user!" });

			var result = await _userManager.ConfirmEmailAsync(user, model.Code).ConfigureAwait(false);
			if (result.Succeeded)
				return Ok(result);

			return BadRequest(result.Errors.Select(x => x.Description));
		}

		/// <summary>
		/// Register an account
		/// </summary>
		/// <param name="model">RegisterViewModel</param>
		/// <returns></returns>
		[HttpPost]
		[ProducesResponseType(typeof(IdentityResult), 200)]
		[ProducesResponseType(typeof(IEnumerable<string>), 400)]
		[Route("register")]
		public async Task<IActionResult> Register([FromBody] RegisterViewModel model)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState.Values.Select(x => x.Errors.FirstOrDefault().ErrorMessage));

			var user = new ApplicationUser { UserName = model.UserName, Email = model.Email, FirstName = model.FirstName, LastName = model.LastName };
			if (!_configuration.GetSection("EmailFeature").Get<bool>())
				user.EmailConfirmed = true;

			var result = await _userManager.CreateAsync(user, model.Password).ConfigureAwait(false);

			if (result.Succeeded)
			{
				var code = await _userManager.GenerateEmailConfirmationTokenAsync(user).ConfigureAwait(false);
				var callbackUrl = $"{_client.Url}{_client.EmailConfirmationPath}?uid={user.Id}&code={System.Net.WebUtility.UrlEncode(code)}";

				await _emailService.SendEmailConfirmationAsync(model.Email, callbackUrl).ConfigureAwait(false);

				return Ok();
			}

			return BadRequest(result.Errors.Select(x => x.Description));
		}

		/// <summary>
		/// Log into account
		/// </summary>
		/// <param name="model">LoginViewModel</param>
		/// <returns></returns>
		[HttpPost]
		[ProducesResponseType(typeof(TokenModel), 200)]
		[ProducesResponseType(typeof(IEnumerable<string>), 400)]
		[Route("token")]
		public async Task<IActionResult> CreateToken([FromBody] LoginViewModel model)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState.Values.Select(x => x.Errors.FirstOrDefault().ErrorMessage));

			ApplicationUser user = null;
			if (!string.IsNullOrEmpty(model.Email))
				user = await _userManager.FindByEmailAsync(model.Email).ConfigureAwait(false);
			else if (!string.IsNullOrEmpty(model.UserName))
				user = await _userManager.FindByNameAsync(model.UserName).ConfigureAwait(false);

			if (user == null)
				return BadRequest(new string[] { "Invalid credentials." });

			var tokenModel = new TokenModel()
			{
				HasVerifiedEmail = false
			};

			// Only allow login if email is confirmed
			if (!user.EmailConfirmed)
			{
				return Ok(tokenModel);
			}

			// Used as user lock
			if (user.LockoutEnabled)
				return BadRequest(new string[] { "This account has been locked." });

			if (await _userManager.CheckPasswordAsync(user, model.Password).ConfigureAwait(false))
			{
				tokenModel.HasVerifiedEmail = true;

				if (user.TwoFactorEnabled)
				{
					tokenModel.TFAEnabled = true;
					return Ok(tokenModel);
				}
				else
				{
					tokenModel.TFAEnabled = false;

					var refreshToken = GenerateRefreshToken();
					var expiredDate = DateTime.UtcNow.AddHours(_jwt.RefreshInHours)
													.AddDays(model.IsRemember ? _jwt.RememberExtendDays : 0);
					await _repo.Insert(new RefreshToken {
						UserLocalId = user.LocalId,
						Value = refreshToken,
						ExpiredDate = expiredDate,
						IsRemember = model.IsRemember
					});
					tokenModel.RefreshToken = refreshToken;
					tokenModel.RefreshExpireTime = Utils.GetEpochTimeSec(expiredDate);

					JwtSecurityToken jwtSecurityToken = await CreateJwtToken(user).ConfigureAwait(false);
					tokenModel.AccessToken = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken);

					return Ok(tokenModel);
				}
			}

			return BadRequest(new string[] { "Invalid login attempt." });
		}

		/// <summary>
		/// Log in with TFA 
		/// </summary>
		/// <param name="model">LoginWith2faViewModel</param>
		/// <returns></returns>
		[HttpPost]
		[ProducesResponseType(typeof(TokenModel), 200)]
		[ProducesResponseType(typeof(IEnumerable<string>), 400)]
		[Route("tfa")]
		public async Task<IActionResult> LoginWith2fa([FromBody] LoginWith2faViewModel model)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState.Values.Select(x => x.Errors.FirstOrDefault().ErrorMessage));

			var user = await _userManager.FindByEmailAsync(model.Email).ConfigureAwait(false);
			if (user == null)
				return BadRequest(new string[] { "Invalid credentials." });

			if (await _userManager.VerifyTwoFactorTokenAsync(user, "Authenticator", model.TwoFactorCode).ConfigureAwait(false))
			{
				JwtSecurityToken jwtSecurityToken = await CreateJwtToken(user).ConfigureAwait(false);

				var tokenModel = new TokenModel()
				{
					HasVerifiedEmail = true,
					TFAEnabled = false,
					AccessToken = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken)
				};

				return Ok(tokenModel);
			}
			return BadRequest(new string[] { "Unable to verify Authenticator Code!" });
		}

		/// <summary>
		/// Forgot email sends an email with a link containing reset token
		/// </summary>
		/// <param name="model">ForgotPasswordViewModel</param>
		/// <returns></returns>
		[HttpPost]
		[ProducesResponseType(200)]
		[ProducesResponseType(typeof(IEnumerable<string>), 400)]
		[Route("forgotPassword")]
		public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordViewModel model)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState.Values.Select(x => x.Errors.FirstOrDefault().ErrorMessage));

			ApplicationUser user = null;
			if (!string.IsNullOrEmpty(model.Email))
				user = await _userManager.FindByEmailAsync(model.Email).ConfigureAwait(false);
			else if (!string.IsNullOrEmpty(model.UserName))
				user = await _userManager.FindByNameAsync(model.UserName).ConfigureAwait(false);

			if (user == null || !(await _userManager.IsEmailConfirmedAsync(user).ConfigureAwait(false)))
				return BadRequest();

			var code = await _userManager.GeneratePasswordResetTokenAsync(user).ConfigureAwait(false);
			var callbackUrl = $"{_client.Url}{_client.ResetPasswordPath}?uid={user.Id}&code={System.Net.WebUtility.UrlEncode(code)}";

			await _emailService.SendPasswordResetAsync(user.Email, callbackUrl).ConfigureAwait(false);

			return Ok();
		}

		/// <summary>
		/// Reset account password with reset token
		/// </summary>
		/// <param name="model">ResetPasswordViewModel</param>
		/// <returns></returns>
		[HttpPost]
		[ProducesResponseType(typeof(IdentityResult), 200)]
		[ProducesResponseType(typeof(IEnumerable<string>), 400)]
		[Route("resetPassword")]
		public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordViewModel model)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState.Values.Select(x => x.Errors.FirstOrDefault().ErrorMessage));

			var user = await _userManager.FindByIdAsync(model.UserId).ConfigureAwait(false);

			if (!_configuration.GetSection("EmailFeature").Get<bool>())
			{
				if (!string.IsNullOrEmpty(model.Email))
					user = await _userManager.FindByEmailAsync(model.Email).ConfigureAwait(false);
				else if (!string.IsNullOrEmpty(model.UserName))
					user = await _userManager.FindByNameAsync(model.UserName).ConfigureAwait(false);
			}

			if (user == null)
			{
				// Don't reveal that the user does not exist
				return BadRequest(new string[] { "Invalid credentials." });
			}
			var result = await _userManager.ResetPasswordAsync(user, model.Code, model.Password).ConfigureAwait(false);

			if (!_configuration.GetSection("EmailFeature").Get<bool>())
			{
				await _userManager.RemovePasswordAsync(user);
				result = await _userManager.AddPasswordAsync(user, model.Password);
			}

			if (result.Succeeded)
			{
				return Ok(result);
			}
			return BadRequest(result.Errors.Select(x => x.Description));
		}

		/// <summary>
		/// Resend email verification email with token link
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		[ProducesResponseType(200)]
		[ProducesResponseType(typeof(IEnumerable<string>), 400)]
		[Route("resendVerificationEmail")]
		public async Task<IActionResult> resendVerificationEmail([FromBody] UserViewModel model)
		{
			var user = await _userManager.FindByEmailAsync(model.Email).ConfigureAwait(false);
			if (user == null)
				return BadRequest(new string[] { "Could not find user!" });

			var code = await _userManager.GenerateEmailConfirmationTokenAsync(user).ConfigureAwait(false);
			var callbackUrl = $"{_client.Url}{_client.EmailConfirmationPath}?uid={user.Id}&code={System.Net.WebUtility.UrlEncode(code)}";
			await _emailService.SendEmailConfirmationAsync(user.Email, callbackUrl).ConfigureAwait(false);

			return Ok();
		}

		private async Task<JwtSecurityToken> CreateJwtToken(ApplicationUser user)
		{
			var userClaims = await _userManager.GetClaimsAsync(user).ConfigureAwait(false);
			var roles = await _userManager.GetRolesAsync(user).ConfigureAwait(false);

			var roleClaims = new List<Claim>();

			for (int i = 0; i < roles.Count; i++)
			{
				roleClaims.Add(new Claim("roles", roles[i]));
			}

			string ipAddress = IpHelper.GetIpAddress();

			var claims = new[]
			{
				new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
				new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
				new Claim(JwtRegisteredClaimNames.Email, user.Email),
				new Claim("uid", user.Id),
				new Claim("lid", user.LocalId.ToString()),
				new Claim("ip", ipAddress)
			}
			.Union(userClaims)
			.Union(roleClaims);

			var symmetricSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
			var signingCredentials = new SigningCredentials(symmetricSecurityKey, SecurityAlgorithms.HmacSha256);

			var jwtSecurityToken = new JwtSecurityToken(
				issuer: _jwt.Issuer,
				audience: _jwt.Audience,
				claims: claims,
				expires: DateTime.UtcNow.AddMinutes(_jwt.DurationInMinutes),
				signingCredentials: signingCredentials);
			return jwtSecurityToken;
		}

		private JwtSecurityToken CreateToken(List<Claim> authClaims)
		{
			var symmetricSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
			var signingCredentials = new SigningCredentials(symmetricSecurityKey, SecurityAlgorithms.HmacSha256);

			var token = new JwtSecurityToken(
				issuer: _jwt.Issuer,
				audience: _jwt.Audience,
				expires: DateTime.UtcNow.AddMinutes(_jwt.DurationInMinutes),
				claims: authClaims,
				signingCredentials: signingCredentials
			);

			return token;
		}

		[HttpPost]
		[ProducesResponseType(typeof(TokenModel), 200)]
		[ProducesResponseType(typeof(IEnumerable<string>), 400)]
		[Route("refreshToken")]
		public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenViewModel refreshModel)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState.Values.Select(x => x.Errors.FirstOrDefault().ErrorMessage));

			string accessToken = refreshModel.AccessToken;
			string refreshToken = refreshModel.RefreshToken;

			var principal = GetPrincipalFromExpiredToken(accessToken);
			if (principal == null)
			{
				return BadRequest("Invalid access token or refresh token");
			}

			string userIdStr = (principal.Claims).FirstOrDefault(x => x.Type == "lid")?.Value;

			if (string.IsNullOrEmpty(userIdStr)) {
				return BadRequest();
			}
			var userId = long.Parse(userIdStr);
			var fullRfValue = await _repo.GetIsRemember(userId, refreshToken, DateTime.UtcNow);

			if (fullRfValue == null)
			{
				return BadRequest("Invalid access token or refresh token is expired");
			}

			var newAccessToken = CreateToken(principal.Claims.ToList());
			var newRefreshToken = GenerateRefreshToken();
			var newExpiredDate = DateTime.UtcNow.AddHours(_jwt.RefreshInHours)
												.AddDays(fullRfValue.IsRemember ? _jwt.RememberExtendDays : 0);
			fullRfValue.Value = newRefreshToken;
			fullRfValue.ExpiredDate = newExpiredDate;
			var isSuccess = await _repo.Update(fullRfValue);

			if (!isSuccess) {
				return StatusCode(500);
			}

			return Ok(new TokenModel
			{
				AccessToken = new JwtSecurityTokenHandler().WriteToken(newAccessToken),
				RefreshToken = newRefreshToken,
				RefreshExpireTime = Utils.GetEpochTimeSec(newExpiredDate)
			});
		}

		[HttpPost]
		[ProducesResponseType(typeof(TokenModel), 200)]
		[ProducesResponseType(typeof(IEnumerable<string>), 400)]
		[Route("logout")]
		public async Task<IActionResult> Logout([FromBody] LogoutViewModel logoutViewModel)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState.Values.Select(x => x.Errors.FirstOrDefault().ErrorMessage));

			string accessToken = logoutViewModel.AccessToken;
			string refreshToken = logoutViewModel.RefreshToken;
			var principal = GetPrincipalFromExpiredToken(accessToken);
			if (principal == null)
			{
				return BadRequest("Invalid access token or refresh token");
			}
			string userIdStr = (principal.Claims).FirstOrDefault(x => x.Type == "lid")?.Value;
			if (string.IsNullOrEmpty(userIdStr)) {
				return BadRequest();
			}
			var userId = long.Parse(userIdStr);
			
			var isSuccess = await _repo.DeleteByValue(userId, logoutViewModel.RefreshToken);

			return Ok(isSuccess);
		}

		[Authorize]
		[HttpGet]
		[Route("revoke")]
		public async Task<IActionResult> Revoke(string username)
		{
			var sessionContext = SessionContext.ResolveContext(HttpContext);
			if (username != sessionContext.UserName)
				return Unauthorized();
			var user = await _userManager.FindByNameAsync(username);
			if (user == null) return BadRequest("Invalid user name");

			await _repo.DeleteByUserId(sessionContext.UserLocalId);

			return Ok();
		}

		[Authorize]
		[HttpGet]
		[Route("revokeAll")]
		public async Task<IActionResult> RevokeAll()
		{
			await _repo.DeleteAll();

			return Ok();
		}

		private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
		{
			if (token is null)
			{
				throw new ArgumentNullException(nameof(token));
			}

			var tokenValidationParameters = new TokenValidationParameters
			{
				ValidateAudience = false,
				ValidateIssuer = false,
				ValidateIssuerSigningKey = true,
				IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key)),
				ValidateLifetime = false
			};

			var tokenHandler = new JwtSecurityTokenHandler();
			// resolve Identity.Name, ref: https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/issues/415
			tokenHandler.InboundClaimTypeMap[JwtRegisteredClaimNames.Sub] = ClaimTypes.Name;
			var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
			if (!(securityToken is JwtSecurityToken jwtSecurityToken)
				|| !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
				throw new SecurityTokenException("Invalid token");

			return principal;

		}

		private static string GenerateRefreshToken()
		{
			var randomNumber = new byte[64];
			using var rng = RandomNumberGenerator.Create();
			rng.GetBytes(randomNumber);
			return Convert.ToBase64String(randomNumber);
		}
	}
}