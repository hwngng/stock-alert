using System;
using System.Collections.Generic;

namespace AlertService.Services.Models
{
	public class Stock
	{
		public string Symbol { get; set; }
		public string ExchangeCode { get; set; }
		public List<OHLCV> HistoricalPrice { get; set; }
		public Message StockFull { get; set; }
		public DateTime LastSync { get; set; }
	}
}