using System;
using System.Text.Json.Serialization;

namespace AlertService.Services.Models
{
	public class OHLCV
	{
		[JsonPropertyName("dt")]
		public DateTime Date { get; set; }
		[JsonPropertyName("open")]

		public float Open { get; set; }
		[JsonPropertyName("high")]
		public float High { get; set; }
		[JsonPropertyName("low")]
		public float Low { get; set; }
		[JsonPropertyName("close")]
		public float Close { get; set; }
		[JsonPropertyName("volume")]
		public float Volume { get; set; }
	}

	public class OHLCVDataService
	{
		[JsonPropertyName("stock_id")]
		public int StockId { get; set; }
		[JsonPropertyName("symbol")]
		public string Symbol { get; set; }
		[JsonPropertyName("exchange_code")]
		public string ExchangeCode { get; set; }
		[JsonPropertyName("dt")]
		public DateTime Date { get; set; }
		[JsonPropertyName("open")]
		public float Open { get; set; }
		[JsonPropertyName("high")]
		public float High { get; set; }
		[JsonPropertyName("low")]
		public float Low { get; set; }
		[JsonPropertyName("close")]
		public float Close { get; set; }
		[JsonPropertyName("volume")]
		public float Volume { get; set; }
	}
}