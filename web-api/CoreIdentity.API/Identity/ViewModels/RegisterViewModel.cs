﻿using System.ComponentModel.DataAnnotations;

namespace CoreIdentity.API.Identity.ViewModels
{
	public class RegisterViewModel
	{
        [Required]
        [DataType(DataType.Text)]
		public string UserName { get; set; }

		[EmailAddress]
		[DataType(DataType.EmailAddress)]
		public string Email { get; set; }

		[Required]
		[StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
		[DataType(DataType.Password)]
		public string Password { get; set; }

		[DataType(DataType.Password)]
		[Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
		public string ConfirmPassword { get; set; }

        [StringLength(100, ErrorMessage = "The {0} must be at max {1} characters long.")]
		public string FirstName { get; set; }

        [StringLength(100, ErrorMessage = "The {0} must be at max {1} characters long.")]
		public string LastName { get; set; }
	}
}
