using System;

namespace AlertService.Services.Models
{
	public class PricePoint
	{
		public DateTime Date { get; set; }
		public decimal Value { get; set; }

		public PricePoint(DateTime date, decimal value)
		{
			this.Date = date;
			this.Value = value;
		}

		public PricePoint(DateTime date)
		{
			this.Date = date;
		}

		public PricePoint() {}
	}
}