using System;

namespace AlertService.Services.Models
{
	public class Alert
	{
		public string Type { get; set; }
		public string Symbol { get; set; }
		public string Exchange { get; set; }
		public string Message { get; set; }
		public object Description { get; set; }
		public DateTime PublishedAt { get; set; }
		public long MessageTimestamp { get; set; }

		public Alert CreateCopy()
		{
			var copy = new Alert();
			copy.Type = this.Type;
			copy.Symbol = this.Symbol;
			copy.Exchange = this.Exchange;
			copy.Message = this.Message;
			copy.Description = this.Description;
			copy.PublishedAt = this.PublishedAt;
			copy.MessageTimestamp = this.MessageTimestamp;

			return copy;
		}
	}
}