using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace PlaypisoIntranet.Infrastructure;

public class AllowedUsersHandler(IOptions<AllowedUsersOptions> options)
    : AuthorizationHandler<AllowedUsersRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        AllowedUsersRequirement requirement)
    {
        var oid = context.User.FindFirst("oid")?.Value;
        if (oid is not null && options.Value.ObjectIds.Contains(oid))
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}
