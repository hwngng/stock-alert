using System.Text.Json.Serialization;

namespace AlertService.Models
{
	public abstract class Message
	{
		[JsonPropertyName("messageType")]
		public string MessageType { get; set; }     // SMA SFU SBA
		[JsonPropertyName("stockType")]
		public string StockType { get; set; }       // S, ST
	}
}