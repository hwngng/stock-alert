using System.ComponentModel.DataAnnotations;

namespace CoreIdentity.API.Identity.ViewModels
{
	public class LoginViewModel
	{
		public string UserName { get; set; }

		[EmailAddress]
		[DataType(DataType.EmailAddress)]
		public string Email { get; set; }

		[DataType(DataType.Password)]
		public string Password { get; set; }

		public bool IsRemember { get; set; }
	}
}
