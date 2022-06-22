using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace CoreIdentity.API.Identity.Models
{
	public class ApplicationUser : IdentityUser
	{
		[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		[Key, Column(Order = 0)]
		public long LocalId { get; set; }
#nullable enable
		public string? FirstName {get;set;}
		public string? LastName {get;set;}
#nullable disable
	}
}
