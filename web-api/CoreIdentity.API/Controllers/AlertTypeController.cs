using System.Security.Claims;
using System.Threading.Tasks;
using CoreIdentity.API.Common;
using CoreIdentity.Data.Interfaces;
using CoreIdentity.Data.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CoreIdentity.API.Controllers
{
	[Produces("application/json")]
	[Route("api/alertType")]
	public class AlertTypeController : AuthorizedController
	{
		private readonly IAlertTypeRepo _repo;

		public AlertTypeController(IAlertTypeRepo repo, IHttpContextAccessor contextAccessor) : base(contextAccessor)
		{
			this._repo = repo;
            
		}

		/// <summary>
		/// Get alert type by type key, if typeKey is empty then get all alert type
		/// </summary>
		/// <param name="typeKey">string</param>
		/// <returns></returns>
		[HttpGet]
		public async Task<IActionResult> Get(string typeKey)
		{
			if (!string.IsNullOrEmpty(typeKey))
			{
				return Ok(await _repo.GetDetail(typeKey));
			}

            return Ok(await _repo.GetAll());
		}

		/// <summary>
		/// Insert new alert type
		/// </summary>
		/// <param name="alertTypeViewModel">AlertTypeViewModel</param>
		/// <returns></returns>
		// POST: api/alertType
		[Authorize(Roles = "Admin")]
		[HttpPost]
		public async Task<IActionResult> Insert([FromBody] AlertTypeViewModel alertTypeViewModel)
		{
			if (alertTypeViewModel is null || string.IsNullOrEmpty(alertTypeViewModel.TypeKey))
				return BadRequest();
			var status = await _repo.InsertAlertType(alertTypeViewModel);
			if (status < 1) {
				return Forbidden();
			}
			return Ok(new
			{
				Status = status,
			});
		}

		/// <summary>
		/// Update existing alert type
		/// </summary>
		/// <param name="alertTypeViewModel">AlertTypeViewModel</param>
		/// <returns></returns>
		[Authorize(Roles = "Admin")]
		[HttpPut]
		public async Task<IActionResult> Update([FromBody] AlertTypeViewModel alertTypeViewModel)
		{
			if (alertTypeViewModel is null)
				return BadRequest();
			var status = await _repo.UpdateAlertType(alertTypeViewModel);
			if (status < 0)
				return Forbidden();
			return Ok(status);
		}

		/// <summary>
		/// Delete alert type
		/// </summary>
		/// <param name="typeKey">string</param>
		/// <returns></returns>
		[Authorize(Roles = "Admin")]
		[HttpDelete]
		public async Task<IActionResult> Delete(string typeKey)
		{
			if (string.IsNullOrEmpty(typeKey))
			{
				return BadRequest();
			}
			return Ok(await _repo.DeleteAlertType(typeKey));
		}
	}
}