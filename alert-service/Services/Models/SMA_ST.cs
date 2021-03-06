namespace AlertService.Services.Models
{
    public class SMA_ST: Message
    {
		public string Symbol { get; set; }              // code
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
		public decimal? OpenPrice { get; set; }    // open day price
    }
}