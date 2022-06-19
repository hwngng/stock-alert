namespace AlertService.Services.Models
{
	public class SFU_ST : Message
	{
		public string Symbol { get; set; }              // code
		public string ExchangeCode { get; set; }
		public decimal? RefPrice { get; set; }
		public decimal? FloorPrice { get; set; }
		public decimal? CeilingPrice { get; set; }
		public decimal? BidPrice01 { get; set; }
		public decimal? BidPrice02 { get; set; }
		public decimal? BidPrice03 { get; set; }
		public decimal? BidPrice04 { get; set; }
		public decimal? BidPrice05 { get; set; }
		public decimal? BidPrice06 { get; set; }
		public decimal? BidPrice07 { get; set; }
		public decimal? BidPrice08 { get; set; }
		public decimal? BidPrice09 { get; set; }
		public decimal? BidPrice10 { get; set; }
		public long? BidQtty01 { get; set; }
		public long? BidQtty02 { get; set; }
		public long? BidQtty03 { get; set; }
		public long? BidQtty04 { get; set; }
		public long? BidQtty05 { get; set; }
		public long? BidQtty06 { get; set; }
		public long? BidQtty07 { get; set; }
		public long? BidQtty08 { get; set; }
		public long? BidQtty09 { get; set; }
		public long? BidQtty10 { get; set; }
		public decimal? AskPrice01 { get; set; }
		public decimal? AskPrice02 { get; set; }
		public decimal? AskPrice03 { get; set; }
		public decimal? AskPrice04 { get; set; }
		public decimal? AskPrice05 { get; set; }
		public decimal? AskPrice06 { get; set; }
		public decimal? AskPrice07 { get; set; }
		public decimal? AskPrice08 { get; set; }
		public decimal? AskPrice09 { get; set; }
		public decimal? AskPrice10 { get; set; }
		public long? AskQtty01 { get; set; }
		public long? AskQtty02 { get; set; }
		public long? AskQtty03 { get; set; }
		public long? AskQtty04 { get; set; }
		public long? AskQtty05 { get; set; }
		public long? AskQtty06 { get; set; }
		public long? AskQtty07 { get; set; }
		public long? AskQtty08 { get; set; }
		public long? AskQtty09 { get; set; }
		public long? AskQtty10 { get; set; }
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
		public long? MatchQtty { get; set; }
		public decimal? CurrentPrice { get; set; }   // buyForeignQtty
		public long? CurrentQtty { get; set; }
		public decimal? ProjectOpen { get; set; }
		public decimal? TotalRoom { get; set; }
		public decimal? CurrentRoom { get; set; }
	}
}