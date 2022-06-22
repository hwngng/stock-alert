namespace AlertService.Services.Models
{
	public class SFU_S : Message
	{
		public string Symbol { get; set; }              // code
		public string ExchangeCode { get; set; }
		public decimal? RefPrice { get; set; }
		public decimal? FloorPrice { get; set; }
		public decimal? CeilingPrice { get; set; }
		public decimal? BidPrice01 { get; set; }
		public decimal? BidPrice02 { get; set; }
		public decimal? BidPrice03 { get; set; }
		public long? BidQtty01 { get; set; }
		public long? BidQtty02 { get; set; }
		public long? BidQtty03 { get; set; }
		public decimal? AskPrice01 { get; set; }
		public decimal? AskPrice02 { get; set; }
		public decimal? AskPrice03 { get; set; }
		public long? AskQtty01 { get; set; }
		public long? AskQtty02 { get; set; }
		public long? AskQtty03 { get; set; }
		public long? TotalBidQtty { get; set; }
		public long? TotalAskQtty { get; set; }
		public string TradingSessionId { get; set; }
		public long? ForeignBuyQtty { get; set; }
		public long? ForeignSellQtty { get; set; }
		public decimal? DayHigh { get; set; }                // highestPrice
		public decimal? DayLow { get; set; }         // lowestPrice
		public decimal? AccumulatedVal { get; set; } // accumulatedVal
		public long? AccumulatedVol { get; set; }        // accumulatedVol
		public decimal? MatchPrice { get; set; }         // matchPrice
		public long? MatchQtty { get; set; }     // matchQuantity
		public decimal? CurrentPrice { get; set; }   // buyForeignQtty
		public long? CurrentQtty { get; set; }       // matchQuantity
		public decimal? ProjectOpen { get; set; }
		public decimal? TotalRoom { get; set; }
		public decimal? CurrentRoom { get; set; }    // sellForeignQtty
	}
}