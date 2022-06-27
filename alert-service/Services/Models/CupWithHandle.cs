namespace AlertService.Services.Models
{
	public class CupWithHandle
	{
		public PricePoint Current { get; set; }
		public PricePoint LowHandle { get; set; }
		public PricePoint RightHigh { get; set; }
		public PricePoint Dip { get; set; }
		public PricePoint LeftHigh { get; set; }
		public int DipIndex { get; set; }
	}
}