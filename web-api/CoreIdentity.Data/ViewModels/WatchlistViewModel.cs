using System;
using System.Collections.Generic;

namespace CoreIdentity.Data.ViewModels
{
	public class WatchlistViewModel
	{
		public long? Id { get; set; }
#nullable enable
		public string? Name { get; set; }
#nullable disable
		public List<Stock> Symbols { get; set; }
	}
}
