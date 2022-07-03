using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoreIdentity.Data.ViewModels
{
	public class AlertOptionViewModel
	{
		public long? Id { get; set; }
		public string TypeKey { get; set; }
		public List<object> Parameters { get; set; }
		public string Exchange { get; set; }
		public List<string> Symbols { get; set; }
		public long? WatchlistId { get; set; }
		public long? Average5Volumne { get; set; }
	}
}