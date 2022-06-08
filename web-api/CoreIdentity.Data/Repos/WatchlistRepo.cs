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
			var query = _ctx.Watchlists.Where(x => x.UserLocalId == userId)
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
			var comma = "";
			if (watchlist.SymbolJson is null)
			{
				watchlist.SymbolJson = "[]";
			} else if (watchlist.SymbolJson != "[]") {
				comma = ",";
			}
			var serializeOptions = new JsonSerializerOptions
			{
				PropertyNamingPolicy = JsonNamingPolicy.CamelCase
			};
			var singleJson = JsonSerializer.Serialize(watchlistSymbolViewModel.Symbol, serializeOptions);
			_ctx.Watchlists.Attach(watchlist);
			watchlist.SymbolJson = watchlist.SymbolJson.Insert(watchlist.SymbolJson.Length - 1, comma + singleJson);

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
			var comma = "";
			if (!string.IsNullOrEmpty(watchlistViewModel.Name))
			{
				setStm += $"{comma}\"Name\" = {{{argCount++}}}";
				args.Add(watchlistViewModel.Name);
				comma = ",";
			}
			if (!(watchlistViewModel.Symbols is null))
			{
				setStm += $"{comma}\"SymbolJson\" = {{{argCount++}}}";
				var serializeOptions = new JsonSerializerOptions
				{
					PropertyNamingPolicy = JsonNamingPolicy.CamelCase
				};
				args.Add(JsonSerializer.Serialize(watchlistViewModel.Symbols, serializeOptions));
				comma = ",";
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
