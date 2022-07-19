using CoreIdentity.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace CoreIdentity.Data
{
	public class DataContext : DbContext
	{
		public DataContext(DbContextOptions<DataContext> options) : base(options)
		{ }

		// Stored Procedures or tables
		public DbSet<spGetOneExample> spGetOneExample { get; set; }
		public DbSet<spGetManyExamples> spGetManyExamples { get; set; }
		public DbSet<Watchlist> Watchlists { get; set; }
		public DbSet<AlertType> AlertTypes { get; set; }
		public DbSet<AlertOption> AlertOptions { get; set; }
	}
}
