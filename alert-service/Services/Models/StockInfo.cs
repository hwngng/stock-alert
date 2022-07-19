using System.Text.Json.Serialization;

namespace AlertService.Services.Models
{
	public class StockInfo
	{
		[JsonPropertyName("symbol")]
		public string Symbol { get; set; }
		[JsonPropertyName("exchange_code")]
		public string ExchangeCode { get; set; }
	}
}