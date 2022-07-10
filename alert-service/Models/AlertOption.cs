namespace AlertService.Models
{
	public class AlertOption
	{
		public long Id {get;set;}
		public long UserLocalId { get; set; }
		public string TypeKey { get; set; }
		public string ParametersJson { get; set; }
		public string Exchange { get; set; }
		public string SymbolListJson { get; set; }
		public long? WatchlistId { get; set; }
		public long? Average5Volume { get; set; }
	}
}