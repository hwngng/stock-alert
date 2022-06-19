namespace AlertService.Services.Models
{
    public class SBAGeneral : Message
    {
        public string Symbol { get; set; }				// code
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
    }
}