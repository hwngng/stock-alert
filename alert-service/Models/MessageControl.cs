namespace AlertService.Models
{
	public class AggregateControl
	{
		public Message SocketMessage { get; set; }
		public int Timestamp { get; set; }
		public int Count { get; set; }
	}
}