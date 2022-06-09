using System;
using System.Threading.Tasks;
using CoreIdentity.API.Identity.Models;

namespace CoreIdentity.API.Identity.Interfaces
{
    public interface IRefreshTokenRepo
    {
        Task<RefreshToken> GetIsRemember(long userId, string value, DateTime currentDate);
        Task<bool> ValidateRefreshToken(long userId, string value, DateTime currentDate);
        Task<bool> Update(RefreshToken newRefreshToken);
        Task<bool> Insert(RefreshToken refreshToken);
        Task<bool> DeleteByUserId(long userId);
        Task<bool> DeleteAll();
        Task<bool> DeleteByValue(long userId, string value);
    }
}