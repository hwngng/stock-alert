using System;
using System.Text.Json.Serialization;

namespace AlertService.Services.Models
{
	public class OHLCV
	{
		[JsonPropertyName("dt")]
		public DateTime Date { get; set; }
		[JsonPropertyName("open")]
		public decimal Open { get; set; }
		[JsonPropertyName("high")]
		public decimal High { get; set; }
		[JsonPropertyName("low")]
		public decimal Low { get; set; }
		[JsonPropertyName("close")]
		public decimal Close { get; set; }
		[JsonPropertyName("volume")]
		public decimal Volume { get; set; }

		public OHLCV CreateCopy()
		{
			var copy = new OHLCV();
			copy.Date = this.Date;
			copy.Open = this.Open;
			copy.High = this.High;
			copy.Low = this.Low;
			copy.Close = this.Close;
			copy.Volume = this.Volume;

			return copy;
		}
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
		public decimal Open { get; set; }
		[JsonPropertyName("high")]
		public decimal High { get; set; }
		[JsonPropertyName("low")]
		public decimal Low { get; set; }
		[JsonPropertyName("close")]
		public decimal Close { get; set; }
		[JsonPropertyName("volume")]
		public decimal Volume { get; set; }
	}
}