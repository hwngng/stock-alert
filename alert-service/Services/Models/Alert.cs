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
	}
}