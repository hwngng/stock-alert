using System.Net.Mime;
using CoreIdentity.API.Identity.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CoreIdentity.API.Identity
{
    public class SecurityContext : IdentityDbContext<ApplicationUser>
    {
        public SecurityContext(DbContextOptions<SecurityContext> options)
            : base(options)
        {
            // Database.EnsureCreated();
        }
    }
}
