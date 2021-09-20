using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApp1.Data;
using static WebApp1.Models.CustomSettings;

namespace WebApp1.Areas.Identity.Models
{
    public static class IdentitySeedData
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            RoleManager<IdentityRole> roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            string rolename = "Admin";
            bool existRole = roleManager.RoleExistsAsync(rolename).Result;
            if (!existRole)
            {
                roleManager.CreateAsync(new IdentityRole { Name = rolename });
            }

            UserManager<IdentityUser> userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();
            IOptions<CustomSection> customSection = serviceProvider.GetRequiredService<IOptions<CustomSection>>();
            string email = customSection.Value.AdminEmail;
            bool existUser = userManager.Users.Any(u => u.Email == customSection.Value.AdminEmail);
            if (!existUser)
            {
                //Here we create a Admin super user who will maintain the website

                IdentityUser user = new IdentityUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true
                };
                IdentityResult chkUser = userManager.CreateAsync(user, customSection.Value.AdminPassword).Result;

                //Add default User to Role Admin
                if (chkUser.Succeeded)
                {
                    IdentityResult result = userManager.AddToRoleAsync(user, rolename).Result;
                }
            }

        }
    }
}
