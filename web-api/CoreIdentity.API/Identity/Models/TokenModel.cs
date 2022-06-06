namespace CoreIdentity.API.Identity.Models
{
	public class TokenModel
	{
		public bool? HasVerifiedEmail { get; set; }
		public bool? TFAEnabled { get; set; }
		public string Token { get; set; }
        public string RefreshToken { get; set; }
	}
}