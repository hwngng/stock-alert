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
	public class AlertTypeRepo : IAlertTypeRepo
	{
		private DataContext _ctx;

		public AlertTypeRepo(DataContext ctx)
		{
			_ctx = ctx;
		}

		public async Task<IEnumerable<AlertType>> GetAll()
		{
			var query = _ctx.AlertTypes.Select(x => new AlertType
			{
				TypeKey = x.TypeKey,
				Title = x.Title,
				Parent = x.Parent
			});
			return await query.ToListAsync();
		}

		public async Task<AlertType> GetDetail(string typeKey)
		{
			var query = _ctx.AlertTypes.Where(x => x.TypeKey == typeKey)
										.Select(x => new AlertType
										{
											TypeKey = x.TypeKey,
											Title = x.Title,
											Parent = x.Parent
										});
			return await query.FirstOrDefaultAsync();
		}

		public async Task<int> InsertAlertType(AlertTypeViewModel alertTypeViewModel)
		{
			var alertType = new AlertType
			{
				TypeKey = alertTypeViewModel.TypeKey,
				Title = alertTypeViewModel.Title,
				Parent = alertTypeViewModel.Parent
			};
			var watchlistCreated = _ctx.AlertTypes.Add(alertType);
			var status = await _ctx.SaveChangesAsync();

			return status;
		}

		public async Task<int> UpdateAlertType(AlertTypeViewModel alertTypeViewModel)
		{
			if (string.IsNullOrEmpty(alertTypeViewModel.TypeKey))
				return await Task.FromResult(-1);

			var updateStatement = "UPDATE \"AlertTypes\" SET ";
			var args = new List<object>();
			var setStm = "";
			var argCount = 0;
			var comma = "";

			if (!string.IsNullOrEmpty(alertTypeViewModel.Title))
			{
				setStm += $"{comma}\"Title\" = {{{argCount++}}}";
				args.Add(alertTypeViewModel.Title);
				comma = ",";
			}

			if (!string.IsNullOrEmpty(alertTypeViewModel.Parent))
			{
				setStm += $"{comma}\"Parent\" = {{{argCount++}}}";
				args.Add(alertTypeViewModel.Parent);
				comma = ",";
			}

			if (string.IsNullOrEmpty(setStm))
				return await Task.FromResult(-1);

			updateStatement += setStm;
			updateStatement += $" WHERE \"TypeKey\"={{{argCount++}}}";
			args.Add(alertTypeViewModel.TypeKey);

			return await _ctx.Database.ExecuteSqlRawAsync(updateStatement, args);
		}

		public async Task<int> DeleteAlertType(string typeKey)
		{
			return await _ctx.Database.ExecuteSqlInterpolatedAsync($"DELETE FROM \"AlertTypes\" WHERE \"TypeKey\"={typeKey}");
		}
	}
}
