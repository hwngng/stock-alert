using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoreIdentity.API.Identity.Models
{
	public class RefreshToken
	{
		[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		[Key, Column(Order = 0)]
		public long Id { get; set; }
		public long UserLocalId { get; set; }
		public string Value { get; set; }
		public bool IsRemember { get; set; }
		public DateTime ExpiredDate { get; set; }
		public DateTime? CreatedAt { get; set; }
#nullable enable
		public string? Machine { get; set; }
#nullable disable
	}
}