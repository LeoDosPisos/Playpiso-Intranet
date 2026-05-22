using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;

namespace PlaypisoIntranet.Infrastructure;

public class UserClaimsLoggingMiddleware(
    RequestDelegate next,
    ILogger<UserClaimsLoggingMiddleware> logger,
    IOptions<AllowedUsersOptions> allowedUsersOptions)
{
    public async Task InvokeAsync(HttpContext context)
    {
        LogClaims(context);
        await next(context);
    }

    private void LogClaims(HttpContext context)
    {
        var user = context.User;
        var method = context.Request.Method;
        var path = context.Request.Path + context.Request.QueryString;
        var isAuthenticated = user?.Identity?.IsAuthenticated == true;

        var sb = new StringBuilder();
        sb.AppendLine();
        sb.AppendLine("┌─ Request ──────────────────────────────────────────");
        sb.AppendLine($"│ {method} {path}");

        if (!isAuthenticated)
        {
            sb.AppendLine("│ (requisição anônima — User não autenticado)");
            sb.AppendLine("└────────────────────────────────────────────────────");
            logger.LogInformation("{ClaimsDump}", sb.ToString());
            return;
        }

        var principal = user!;
        var userId = principal.FindFirstValue("oid") ?? principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        var email = principal.FindFirstValue("email")
            ?? principal.FindFirstValue("preferred_username")
            ?? principal.FindFirstValue("upn")
            ?? principal.FindFirstValue("unique_name");
        var name = principal.FindFirstValue("name") ?? email;
        var isAdmin = allowedUsersOptions.Value.AdminObjectIds.Contains(userId);
        var claimCount = principal.Claims.Count();

        sb.AppendLine($"│ UserId         : {userId}");
        sb.AppendLine($"│ Email          : {email ?? "(vazio)"}");
        sb.AppendLine($"│ Name           : {name ?? "(vazio)"}");
        sb.AppendLine($"│ IsAdmin        : {isAdmin}");
        sb.AppendLine($"│ IsAuthenticated: {isAuthenticated}");
        sb.AppendLine($"│ Claims totais  : {claimCount}");
        sb.AppendLine("│ ─── Todas as claims ────────────────────────────────");

        var maxTypeWidth = principal.Claims.Max(c => ShortType(c.Type).Length);
        foreach (var claim in principal.Claims)
        {
            var type = ShortType(claim.Type).PadRight(maxTypeWidth);
            var value = Truncate(claim.Value, 120);
            sb.AppendLine($"│   {type} : {value}");
        }

        sb.AppendLine("└────────────────────────────────────────────────────");

        logger.LogInformation("{ClaimsDump}", sb.ToString());
    }

    private static string ShortType(string claimType)
    {
        var slash = claimType.LastIndexOf('/');
        return slash >= 0 && slash < claimType.Length - 1 ? claimType[(slash + 1)..] : claimType;
    }

    private static string Truncate(string value, int max)
        => value.Length <= max ? value : value[..max] + "…";
}
