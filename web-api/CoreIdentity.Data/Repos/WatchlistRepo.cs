using CoreIdentity.Data.Interfaces;
using CoreIdentity.Data.Models;
using CoreIdentity.Data.ViewModels;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace CoreIdentity.Data.Repos
{
	public class WatchlistRepo : IWatchlistRepo
	{
		private DataContext _ctx;

		public WatchlistRepo(DataContext ctx)
		{
			_ctx = ctx;
		}

		public async Task<IEnumerable<Watchlist>> GetByUserId(long userId)
		{
			var query =  _ctx.Watchlists.Where(x => x.UserLocalId == userId)
										.Select(x => new Watchlist
										{
											Id = x.Id,
											Name = x.Name,
											UserLocalId = x.UserLocalId
										});
			return await query.ToListAsync();
		}

		public async Task<Watchlist> GetDetailById(long userId, long id)
		{
			var query = _ctx.Watchlists.Where(x => x.Id == id && x.UserLocalId == userId)
										.Select(x => new Watchlist
										{
											Id = x.Id,
											SymbolJson = x.SymbolJson,
											UserLocalId = userId
										});
			return await query.FirstOrDefaultAsync();
		}

		public async Task<(int Status, long Id)> InsertWatchlist(long userId, WatchlistViewModel watchlistViewModel)
		{
			var watchlist = new Watchlist
			{
				Name = watchlistViewModel.Name,
				UserLocalId = userId,
				SymbolJson = watchlistViewModel.Symbols is null ? null : JsonSerializer.Serialize(watchlistViewModel.Symbols)
			};
			var watchlistCreated = _ctx.Watchlists.Add(watchlist);
			var status = await _ctx.SaveChangesAsync();
			var id = watchlistCreated.Entity.Id;

			return (status, id);
		}

		public async Task<int> InsertSymbol(long userId, WatchlistSymbolViewModel watchlistSymbolViewModel)
		{
			var watchlist = await this.GetDetailById(userId, watchlistSymbolViewModel.Id);
			if (watchlist is null)
				return await Task.FromResult(-1);
			List<Stock> symbolLst;
			if (watchlist.SymbolJson is null)
			{
				symbolLst = new List<Stock>();
			}
			else
			{
				symbolLst = JsonSerializer.Deserialize<List<Stock>>(watchlist.SymbolJson);
			}
			symbolLst.Add(watchlistSymbolViewModel.Symbol);
			_ctx.Watchlists.Attach(watchlist);
			watchlist.SymbolJson = JsonSerializer.Serialize(symbolLst);
			return await _ctx.SaveChangesAsync();
		}

		public async Task<int> UpdateWatchlist(long userId, WatchlistViewModel watchlistViewModel)
		{
			if (!watchlistViewModel.Id.HasValue)
				return await Task.FromResult(-1);

			var updateStatement = "UPDATE \"Watchlists\" SET ";
			var args = new List<object>();
			var setStm = "";
			var argCount = 0;

			if (!string.IsNullOrEmpty(watchlistViewModel.Name))
			{
				setStm += $"\"Name\" = {{{argCount++}}}";
				args.Add(watchlistViewModel.Name);
			}
			if (!(watchlistViewModel.Symbols is null))
			{
				setStm += $",\"SymbolJson\" = {{{argCount++}}}";
				args.Add(JsonSerializer.Serialize(watchlistViewModel.Symbols));
			}
			if (string.IsNullOrEmpty(setStm))
				return await Task.FromResult(-1);
			updateStatement += setStm;
			updateStatement += $" WHERE \"Id\"={{{argCount++}}} AND \"UserLocalId\"={{{argCount++}}}";
			args.Add(watchlistViewModel.Id);
			args.Add(userId);

			return await _ctx.Database.ExecuteSqlRawAsync(updateStatement, args);
		}

		public async Task<int> DeleteWatchlist(long userId, long id)
		{
			return await _ctx.Database.ExecuteSqlInterpolatedAsync($"DELETE FROM \"Watchlists\" WHERE \"Id\"={id} AND \"UserLocalId\"={userId}");
		}
	}
}
