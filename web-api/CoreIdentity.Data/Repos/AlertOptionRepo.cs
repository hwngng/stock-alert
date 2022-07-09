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
	public class AlertOptionRepo : IAlertOptionRepo
	{
		private DataContext _ctx;

		public AlertOptionRepo(DataContext ctx)
		{
			_ctx = ctx;
		}

		public async Task<IEnumerable<AlertOption>> GetByUserId(long userId)
		{
			var query = _ctx.AlertOptions.Where(x => x.UserLocalId == userId)
										.Select(x => new AlertOption
										{
											Id = x.Id,
											UserLocalId = x.UserLocalId,
											TypeKey = x.TypeKey,
											ParametersJson = x.ParametersJson,
											Exchange = x.Exchange,
											SymbolListJson = x.SymbolListJson,
											WatchlistId = x.WatchlistId,
											Average5Volume = x.Average5Volume
										})
										.OrderBy(x => x.Id);
			return await query.ToListAsync();
		}

		public async Task<AlertOption> GetDetailById(long userId, long id)
		{
			var query = _ctx.AlertOptions.Where(x => x.Id == id && x.UserLocalId == userId)
										.Select(x => new AlertOption
										{
											Id = x.Id,
											UserLocalId = x.UserLocalId,
											TypeKey = x.TypeKey,
											ParametersJson = x.ParametersJson,
											Exchange = x.Exchange,
											SymbolListJson = x.SymbolListJson,
											WatchlistId = x.WatchlistId,
											Average5Volume = x.Average5Volume
										});
			return await query.FirstOrDefaultAsync();
		}

		public async Task<(int Status, long Id)> InsertAlertOption(long userId, AlertOptionViewModel alertOptionViewModel)
		{
			var alertOption = new AlertOption
			{
				UserLocalId = userId,
				TypeKey = alertOptionViewModel.TypeKey,
				ParametersJson = alertOptionViewModel.Parameters is null ? null : JsonSerializer.Serialize(alertOptionViewModel.Parameters),
				Exchange = alertOptionViewModel.Exchange,
				SymbolListJson = alertOptionViewModel.Symbols is null ? null : JsonSerializer.Serialize(alertOptionViewModel.Symbols),
				WatchlistId = alertOptionViewModel.WatchlistId,
				Average5Volume = alertOptionViewModel.Average5Volumne
			};
			var alertOptionCreated = _ctx.AlertOptions.Add(alertOption);
			var status = await _ctx.SaveChangesAsync();
			var id = alertOptionCreated.Entity.Id;

			return (status, id);
		}

		public async Task<int> UpdateAlertOption(long userId, AlertOptionViewModel alertOptionViewModel)
		{
			if (!alertOptionViewModel.Id.HasValue)
				return await Task.FromResult(-1);

			var updateStatement = "UPDATE \"AlertOptions\" SET ";
			var args = new List<object>();
			var setStm = "";
			var argCount = 0;
			var comma = "";
			if (!string.IsNullOrEmpty(alertOptionViewModel.TypeKey))
			{
				setStm += $"{comma}\"TypeKey\" = {{{argCount++}}}";
				args.Add(alertOptionViewModel.TypeKey);
				comma = ",";
			}
			if (!string.IsNullOrEmpty(alertOptionViewModel.Exchange))
			{
				setStm += $"{comma}\"Exchange\" = {{{argCount++}}}";
				args.Add(alertOptionViewModel.Exchange);
				comma = ",";
			}
			if (alertOptionViewModel.Average5Volumne.HasValue)
			{
				setStm += $"{comma}\"Average5Volumne\" = {{{argCount++}}}";
				args.Add(alertOptionViewModel.Average5Volumne);
				comma = ",";
			}
			if (alertOptionViewModel.WatchlistId.HasValue)
			{
				setStm += $"{comma}\"WatchlistId\" = {{{argCount++}}}";
				args.Add(alertOptionViewModel.Average5Volumne);
				comma = ",";
			}
			if (!(alertOptionViewModel.Parameters is null))
			{
				setStm += $"{comma}\"ParametersJson\" = {{{argCount++}}}";
				var serializeOptions = new JsonSerializerOptions
				{
					PropertyNamingPolicy = JsonNamingPolicy.CamelCase
				};
				args.Add(JsonSerializer.Serialize(alertOptionViewModel.Parameters, serializeOptions));
				comma = ",";
			}
			if (!(alertOptionViewModel.Symbols is null))
			{
				setStm += $"{comma}\"SymbolListJson\" = {{{argCount++}}}";
				var serializeOptions = new JsonSerializerOptions
				{
					PropertyNamingPolicy = JsonNamingPolicy.CamelCase
				};
				args.Add(JsonSerializer.Serialize(alertOptionViewModel.Symbols, serializeOptions));
				comma = ",";
			}
			if (string.IsNullOrEmpty(setStm))
				return await Task.FromResult(-1);
			updateStatement += setStm;
			updateStatement += $" WHERE \"Id\"={{{argCount++}}} AND \"UserLocalId\"={{{argCount++}}}";
			args.Add(alertOptionViewModel.Id);
			args.Add(userId);

			return await _ctx.Database.ExecuteSqlRawAsync(updateStatement, args);
		}

		public async Task<int> DeleteAlertOption(long userId, long id)
		{
			return await _ctx.Database.ExecuteSqlInterpolatedAsync($"DELETE FROM \"AlertOptions\" WHERE \"Id\"={id} AND \"UserLocalId\"={userId}");
		}
	}
}
