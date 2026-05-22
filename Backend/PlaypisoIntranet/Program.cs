using Dapper;
using DbUp;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using PlaypisoIntranet.Infrastructure;
using PlaypisoIntranet.Repositories;
using PlaypisoIntranet.Services;

SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());
DefaultTypeMap.MatchNamesWithUnderscores = true;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("Connection string 'Default' not found.");

// migrations via DbUp
EnsureDatabase.For.PostgresqlDatabase(connectionString);
var upgrader = DeployChanges.To
    .PostgresqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(typeof(Program).Assembly)
    .LogToConsole()
    .Build();
var result = upgrader.PerformUpgrade();
if (!result.Successful)
    throw new Exception("Migration falhou: " + result.Error);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var disableAuthentication = builder.Environment.IsDevelopment()
    && builder.Configuration.GetValue("Authentication:DisableAzureAd", true);

if (!disableAuthentication)
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

    builder.Services.Configure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
    {
        options.MapInboundClaims = false;
    });
}

builder.Services.Configure<AllowedUsersOptions>(builder.Configuration.GetSection("AllowedUsers"));
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AllowedUsers", policy =>
    {
        if (disableAuthentication)
            policy.RequireAssertion(_ => true);
        else
            policy.RequireAuthenticatedUser();
    });
});

builder.Services.AddSingleton<IProposalRepository>(_ => new ProposalRepository(connectionString));

builder.Services.AddHttpClient<PptxGeneratorClient>(client =>
{
    var url = builder.Configuration["PptxGeneratorUrl"] ?? "http://localhost:8000";
    client.BaseAddress = new Uri(url);
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"];
        policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors();
if (!disableAuthentication)
    app.UseAuthentication();

if (app.Environment.IsDevelopment())
    app.UseMiddleware<UserClaimsLoggingMiddleware>();

app.UseAuthorization();
app.MapControllers();
app.Run();
