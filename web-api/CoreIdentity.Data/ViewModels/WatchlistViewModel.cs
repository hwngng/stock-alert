using System;
using System.Collections.Generic;

namespace CoreIdentity.Data.ViewModels
{
	public class WatchlistViewModel
	{
		public long? Id { get; set; }
		public string Name { get; set; }
		public List<Stock> Symbols { get; set; }
	}
}
