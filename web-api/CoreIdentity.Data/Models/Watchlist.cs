using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoreIdentity.Data.Models
{
	public class Watchlist
	{
		[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		[Key]
		public long Id { get; set; }
		public string Name { get; set; }
#nullable enable
		public string? SymbolJson { get; set; }
#nullable disable
		public long UserLocalId { get; set; }
		public DateTime? CreatedTime { get; set; }
		public DateTime? ModifiedTime { get; set; }
	}
}