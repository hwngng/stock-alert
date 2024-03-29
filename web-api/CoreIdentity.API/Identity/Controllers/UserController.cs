﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;
using CoreIdentity.API.Identity.ViewModels;
using System.Collections.Generic;
using CoreIdentity.API.Controllers;
using Microsoft.AspNetCore.Http;
using CoreIdentity.API.Identity.Models;

namespace CoreIdentity.API.Identity.Controllers
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [Produces("application/json")]
    [Route("api/user")]
    public class UserController : AuthorizedController
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public UserController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IHttpContextAccessor contextAccessor
            ) : base(contextAccessor)
        {
            this._userManager = userManager;
            this._roleManager = roleManager;
        }

        /// <summary>
        /// Get current user
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType(typeof(ApplicationUser), 200)]
        [ProducesResponseType(typeof(IEnumerable<string>), 400)]
        [Route("current")]
        public IActionResult GetInfo()
        {
            var userName = _sessionContext.UserName;

            return Ok(_userManager.Users
                .Where(user => user.UserName == userName)
                .Select(user => new
                {
                    user.Id,
                    user.UserName,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.PhoneNumber
                })
                .FirstOrDefault());
        }

        /// <summary>
        /// Get all users
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ApplicationUser>), 200)]
        [Route("get")]
        public IActionResult Get() => Ok(
            _userManager.Users.Select(user => new
            {
                user.Id,
                user.Email,
                user.PhoneNumber,
                user.EmailConfirmed,
                user.LockoutEnabled,
                user.TwoFactorEnabled
            }));

        /// <summary>
        /// Get a user
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType(typeof(ApplicationUser), 200)]
        [ProducesResponseType(typeof(IEnumerable<string>), 400)]
        [Route("get/{Id}")]
        public IActionResult Get(string Id)
        {
            if (String.IsNullOrEmpty(Id))
                return BadRequest(new string[] { "Empty parameter!" });

            return Ok(_userManager.Users
                .Where(user => user.Id == Id)
                .Select(user => new
                {
                    user.Id,
                    user.Email,
                    user.PhoneNumber,
                    user.EmailConfirmed,
                    user.LockoutEnabled,
                    user.TwoFactorEnabled
                })
                .FirstOrDefault());
        }

        /// <summary>
        /// Insert a user with an existing role
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(typeof(IdentityResult), 200)]
        [ProducesResponseType(typeof(IEnumerable<string>), 400)]
        [Route("insertWithRole")]
        public async Task<IActionResult> Post([FromBody]UserViewModel model)
        {
            if (model == null)
                return BadRequest(new string[] { "No data in model!" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState.Values.Select(x => x.Errors.FirstOrDefault().ErrorMessage));

            ApplicationUser user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                EmailConfirmed = model.EmailConfirmed,
                PhoneNumber = model.PhoneNumber
            };

            IdentityRole role = await _roleManager.FindByIdAsync(model.RoleId).ConfigureAwait(false);
            if (role == null)
                return BadRequest(new string[] { "Could not find role!" });

            IdentityResult result = await _userManager.CreateAsync(user, model.Password).ConfigureAwait(false);
            if (result.Succeeded)
            {
                IdentityResult result2 = await _userManager.AddToRoleAsync(user, role.Name).ConfigureAwait(false);
                if (result2.Succeeded)
                {
                    return Ok(new
                    {
                        user.Id,
                        user.Email,
                        user.PhoneNumber,
                        user.EmailConfirmed,
                        user.LockoutEnabled,
                        user.TwoFactorEnabled
                    });
                }
            }
            return BadRequest(result.Errors.Select(x => x.Description));
        }

        /// <summary>
        /// Update a user
        /// </summary>
        /// <param name="Id"></param>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPut]
        [ProducesResponseType(typeof(IdentityResult), 200)]
        [ProducesResponseType(typeof(IEnumerable<string>), 400)]
        [Route("update/{Id}")]
        public async Task<IActionResult> Put(string Id, [FromBody]EditUserViewModel model)
        {
            if (model == null)
                return BadRequest(new string[] { "No data in model!" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState.Values.Select(x => x.Errors.FirstOrDefault().ErrorMessage));

            ApplicationUser user = await _userManager.FindByIdAsync(Id).ConfigureAwait(false);
            if (user == null)
                return BadRequest(new string[] { "Could not find user!" });

            // Add more fields to update
            user.Email = model.Email;
            user.UserName = model.Email;
            user.EmailConfirmed = model.EmailConfirmed;
            user.PhoneNumber = model.PhoneNumber;
            user.LockoutEnabled = model.LockoutEnabled;
            user.TwoFactorEnabled = model.TwoFactorEnabled;

            IdentityResult result = await _userManager.UpdateAsync(user).ConfigureAwait(false);
            if (result.Succeeded)
            {
                return Ok();
            }
            return BadRequest(result.Errors.Select(x => x.Description));
        }

        /// <summary>
        /// Delete a user (Will also delete link to roles)
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        [HttpDelete]
        [ProducesResponseType(typeof(IdentityResult), 200)]
        [ProducesResponseType(typeof(IEnumerable<string>), 400)]
        [Route("delete/{Id}")]
        public async Task<IActionResult> Delete(string Id)
        {
            if (String.IsNullOrEmpty(Id))
                return BadRequest(new string[] { "Empty parameter!" });

            ApplicationUser user = await _userManager.FindByIdAsync(Id).ConfigureAwait(false);
            if (user == null)
                return BadRequest(new string[] { "Could not find user!" });

            IdentityResult result = await _userManager.DeleteAsync(user).ConfigureAwait(false);
            if (result.Succeeded)
            {
                return Ok();
            }
            return BadRequest(result.Errors.Select(x => x.Description));
        }
    }
}
