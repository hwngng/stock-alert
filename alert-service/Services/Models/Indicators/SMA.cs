using System.Collections.Generic;

namespace AlertService.Services.Models.Indicator
{
	public class SMA
	{
		public SMA(int period)
		{
			this.Period = period;
		}
		public int Period { get; set; }
		public List<PricePoint> Points { get; set; }
	}
}