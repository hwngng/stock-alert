using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace AlertService.Services.Models
{
	public class StockInfoResponse
	{
		[JsonPropertyName("version")]
		public string Version { get; set; }
		[JsonPropertyName("count")]
		public long Count { get; set; }
		[JsonPropertyName("data")]
		public List<StockInfo> Infos { get; set; }
	}
}