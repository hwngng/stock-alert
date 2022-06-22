using System.ComponentModel.DataAnnotations;

namespace CoreIdentity.API.Identity.ViewModels
{
	public class LogoutViewModel
	{
        [Required]
		public string AccessToken { get; set; }
        [Required]
		public string RefreshToken { get; set; }
	}
}