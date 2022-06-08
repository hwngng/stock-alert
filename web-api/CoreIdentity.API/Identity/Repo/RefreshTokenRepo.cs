using System;
using System.Linq;
using System.Threading.Tasks;
using CoreIdentity.API.Identity.Interfaces;
using CoreIdentity.API.Identity.Models;
using Microsoft.EntityFrameworkCore;

namespace CoreIdentity.API.Identity.Repo
{
	public class RefreshTokenRepo : IRefreshTokenRepo
	{
		private SecurityContext _ctx;

		public RefreshTokenRepo(SecurityContext ctx)
		{
			_ctx = ctx;
		}

		public async Task<RefreshToken> GetIsRemember(long userId, string value, DateTime currentDate)
		{
            var query = _ctx.RefreshTokens.Where(x => x.UserLocalId == userId && x.Value == value && x.ExpiredDate > currentDate)
                                        .Select(x => new RefreshToken {
                                            Id = x.Id,
                                            IsRemember = x.IsRemember
                                        });

            return await query.FirstOrDefaultAsync();
		}

		public async Task<bool> ValidateRefreshToken(long userId, string value, DateTime currentDate)
		{
            var count = await _ctx.RefreshTokens.Where(x => x.UserLocalId == userId && x.Value == value && x.ExpiredDate > currentDate)
                                            .CountAsync();

            return count > 0;
		}

        public async Task<bool> Update(RefreshToken newRefreshToken)
        {
            var entry = _ctx.Entry<RefreshToken>(newRefreshToken);
            _ctx.RefreshTokens.Attach(newRefreshToken);
            entry.Property(x => x.Value).IsModified = true;
            entry.Property(x => x.ExpiredDate).IsModified = true;
            return await _ctx.SaveChangesAsync() > 0;
        }

        public async Task<bool> Insert(RefreshToken refreshToken)
        {
            _ctx.RefreshTokens.Add(refreshToken);
            return await _ctx.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteByUserId(long userId)
        {
            var affected =  await _ctx.Database.ExecuteSqlInterpolatedAsync($"DELETE FROM \"RefreshTokens\" WHERE \"UserLocalId\"={userId}");

            return affected > 0;
        }

        public async Task<bool> DeleteAll()
        {
            var affected =  await _ctx.Database.ExecuteSqlInterpolatedAsync($"DELETE FROM \"RefreshTokens\"");

            return affected > 0;
        }
	}
}