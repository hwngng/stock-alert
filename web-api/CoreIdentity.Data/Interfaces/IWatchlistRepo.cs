using System.Collections.Generic;
using System.Threading.Tasks;
using CoreIdentity.Data.Models;
using CoreIdentity.Data.ViewModels;

namespace CoreIdentity.Data.Interfaces
{
    public interface IWatchlistRepo
    {
        Task<IEnumerable<Watchlist>> GetByUserId (long userId);
        Task<Watchlist> GetDetailById (long userId, long id);
        Task<(int Status, long Id)> InsertWatchlist (long userId, WatchlistViewModel watchlistViewModel);
        Task<int> UpdateWatchlist (long userId, WatchlistViewModel watchlistViewModel);
        Task<int> DeleteWatchlist (long userId, long id);
        Task<int> InsertSymbol (long userId, WatchlistSymbolViewModel watchlistSymbolViewModel);
    }
}