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
	[Route("api/watchlist")]
	public class WatchlistController : AuthorizedController
	{
		private readonly IWatchlistRepo _repo;

		public WatchlistController(IWatchlistRepo repo, IHttpContextAccessor contextAccessor) : base(contextAccessor)
		{
			this._repo = repo;
            
		}

		/// <summary>
		/// Get watchlist that belonged to current user, if id not given, all one's watchlist will be returned
		/// </summary>
		/// <param name="id">int</param>
		/// <returns></returns>
		/// GET: api/watchlist
		/// GET: api/watchlist?id=1
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
		/// Insert new watch list
		/// </summary>
		/// <param name="watchlistViewModel">WatchlistViewModel</param>
		/// <returns></returns>
		// PUT: api/example/5
		[HttpPost]
		public async Task<IActionResult> Insert([FromBody] WatchlistViewModel watchlistViewModel)
		{
			if (watchlistViewModel is null || string.IsNullOrEmpty(watchlistViewModel.Name))
				return BadRequest();
			var (status, insertedId) = await _repo.InsertWatchlist(_sessionContext.UserLocalId, watchlistViewModel);
			if (status < 1) {
				return Forbid();
			}
			return Ok(new
			{
				Status = status,
				Id = insertedId
			});
		}

		/// <summary>
		/// Update existing watchlist
		/// </summary>
		/// <param name="watchlistViewModel">WatchlistViewModel</param>
		/// <returns></returns>
		[HttpPut]
		public async Task<IActionResult> Update([FromBody] WatchlistViewModel watchlistViewModel)
		{
			if (watchlistViewModel is null)
				return BadRequest();
			var status = await _repo.UpdateWatchlist(_sessionContext.UserLocalId, watchlistViewModel);
			if (status < 0)
				return Forbid();
			return Ok(status);
		}

		/// <summary>
		/// Delete watchlist belonged to current user
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
			return Ok(await _repo.DeleteWatchlist(_sessionContext.UserLocalId, id.Value));
		}

		/// <summary>
		/// Insert single symbol to the given watchlist
		/// </summary>
		/// <param name="watchlistSymbolViewModel">WatchlistSymbolViewModel</param>
		/// <returns></returns>
		[HttpPost]
		[Route("symbol")]
		public async Task<IActionResult> InsertSymbol([FromBody] WatchlistSymbolViewModel watchlistSymbolViewModel)
		{
			if (watchlistSymbolViewModel is null
				|| watchlistSymbolViewModel.Symbol is null
				|| string.IsNullOrEmpty(watchlistSymbolViewModel.Symbol.Symbol))
				return BadRequest();
			var status = await _repo.InsertSymbol(_sessionContext.UserLocalId, watchlistSymbolViewModel);
			if (status < 0)
				return Forbid();
			return Ok(status);
		}
	}
}