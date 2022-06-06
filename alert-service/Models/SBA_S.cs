namespace AlertService.Models
{
    public class SBA_S : Message
    {
        public string Symbol { get; set; }              // code
		public string ExchangeCode { get; set; }
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
    }
}