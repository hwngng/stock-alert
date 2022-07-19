using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoreIdentity.Data.ViewModels
{
	public class AlertOptionViewModel
	{
		public long? Id { get; set; }
		public long? UserLocalId { get; set; }
		public string TypeKey { get; set; }
		public List<object> Parameters { get; set; }
		public string ParametersJson { get; set; }
		public string Exchange { get; set; }
		public List<Stock> Symbols { get; set; }
		public string SymbolsJson { get; set; }
		public long? WatchlistId { get; set; }
		public long? Average5Volume { get; set; }
	}
}