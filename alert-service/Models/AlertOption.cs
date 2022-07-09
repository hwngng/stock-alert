namespace AlertService.Models
{
	public class AlertOption
	{
		public string TypeKey { get; set; }
		public string ParametersJson { get; set; }
		public string Exchange { get; set; }
		public long? WatchlistId { get; set; }
		public long Average5Volumne { get; set; }
	}
}