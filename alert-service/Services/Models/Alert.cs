using System;

namespace AlertService.Services.Models
{
	public class Alert
	{
		public string Symbol { get; set; }
		public string Message { get; set; }
		public DateTime PublishedAt { get; set; }
	}
}