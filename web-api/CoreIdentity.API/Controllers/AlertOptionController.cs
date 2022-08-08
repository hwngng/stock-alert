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
	[Route("api/alertOption")]
	public class AlertOptionController : AuthorizedController
	{
		private readonly IAlertOptionRepo _repo;

		public AlertOptionController(IAlertOptionRepo repo, IHttpContextAccessor contextAccessor) : base(contextAccessor)
		{
			this._repo = repo;
            
		}

		/// <summary>
		/// Get alert option that belonged to current user, if id not given, all one's alert option will be returned
		/// </summary>
		/// <param name="id">int</param>
		/// <returns></returns>
		/// GET: api/alertOption
		/// GET: api/alertOption?id=1
		[HttpGet]
		public async Task<IActionResult> Get(int? id)
		{
			if (id.HasValue)
			{
				return Ok(await _repo.GetDetailById(_sessionContext.UserLocalId, id.Value));
			}

            return Ok(await _repo.GetByUserId(_sessionContext.UserLocalId));
		}

		/// <summary>
		/// Insert new alert option
		/// </summary>
		/// <param name="alertOptionViewModel">AlertOptionViewModel</param>
		/// <returns></returns>
		// POST: api/alertOption
		[HttpPost]
		public async Task<IActionResult> Insert([FromBody] AlertOptionViewModel alertOptionViewModel)
		{
			if (alertOptionViewModel is null || (string.IsNullOrEmpty(alertOptionViewModel.TypeKey) && string.IsNullOrEmpty(alertOptionViewModel.TypeKey2)))
				return BadRequest();
			var (status, insertedId) = await _repo.InsertAlertOption(_sessionContext.UserLocalId, alertOptionViewModel);
			if (status < 1) {
				return Forbidden();
			}
			return Ok(new
			{
				Status = status,
				Id = insertedId
			});
		}

		/// <summary>
		/// Update existing alert option
		/// </summary>
		/// <param name="alertOptionViewModel">AlertOptionViewModel</param>
		/// <returns></returns>
		[HttpPut]
		public async Task<IActionResult> Update([FromBody] AlertOptionViewModel alertOptionViewModel)
		{
			if (alertOptionViewModel is null)
				return BadRequest();
			var status = await _repo.UpdateAlertOption(_sessionContext.UserLocalId, alertOptionViewModel);
			if (status < 0)
				return Forbidden();
			return Ok(status);
		}

		/// <summary>
		/// Delete alert option belonged to current user
		/// </summary>
		/// <param name="id">int</param>
		/// <returns></returns>
		[HttpDelete]
		public async Task<IActionResult> Delete(int? id)
		{
			if (!id.HasValue)
			{
				return BadRequest();
			}
			return Ok(await _repo.DeleteAlertOption(_sessionContext.UserLocalId, id.Value));
		}
	}
}