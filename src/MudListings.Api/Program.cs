using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MudListings.Application.Common.Settings;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;
using MudListings.Infrastructure.Data;
using MudListings.Infrastructure.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();

// Add MediatR
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(MudListings.Application.Auth.Commands.LoginCommand).Assembly));

// Register application services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<MudListings.Application.Interfaces.IUserProfileRepository, MudListings.Infrastructure.Repositories.UserProfileRepository>();
builder.Services.AddScoped<MudListings.Application.Interfaces.IMudRepository, MudListings.Infrastructure.Repositories.MudRepository>();
builder.Services.AddScoped<MudListings.Application.Interfaces.IMsspClient, MudListings.Infrastructure.Services.MsspClient>();
builder.Services.AddScoped<MudListings.Application.Interfaces.IReviewRepository, MudListings.Infrastructure.Repositories.ReviewRepository>();
builder.Services.AddScoped<MudListings.Application.Interfaces.IFavoriteRepository, MudListings.Infrastructure.Repositories.FavoriteRepository>();
builder.Services.AddScoped<MudListings.Application.Interfaces.IActivityService, MudListings.Infrastructure.Services.ActivityService>();
builder.Services.AddScoped<MudListings.Application.Interfaces.IActivityRepository, MudListings.Infrastructure.Repositories.ActivityRepository>();
builder.Services.AddScoped<MudListings.Application.Interfaces.ITrendingService, MudListings.Infrastructure.Services.TrendingService>();
builder.Services.AddScoped<MudListings.Application.Interfaces.IMudAdminRepository, MudListings.Infrastructure.Repositories.MudAdminRepository>();
builder.Services.AddScoped<MudListings.Application.Interfaces.IAdminRepository, MudListings.Infrastructure.Repositories.AdminRepository>();

// Configure MSSP Polling
builder.Services.Configure<MudListings.Infrastructure.Services.MsspPollingSettings>(
    builder.Configuration.GetSection(MudListings.Infrastructure.Services.MsspPollingSettings.SectionName));
builder.Services.AddHostedService<MudListings.Infrastructure.Services.MsspPollingService>();

// Configure Trending Updates
builder.Services.Configure<MudListings.Infrastructure.Services.TrendingUpdateSettings>(
    builder.Configuration.GetSection(MudListings.Infrastructure.Services.TrendingUpdateSettings.SectionName));
builder.Services.AddHostedService<MudListings.Infrastructure.Services.TrendingUpdateService>();

// Configure Entity Framework Core with SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT Settings
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? new JwtSettings();
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));

// Configure ASP.NET Core Identity
builder.Services.AddIdentity<User, IdentityRole<Guid>>(options =>
{
    // Password requirements
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 8;
    options.Password.RequiredUniqueChars = 4;

    // User requirements
    options.User.RequireUniqueEmail = true;
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";

    // Sign-in requirements
    options.SignIn.RequireConfirmedEmail = true;
    options.SignIn.RequireConfirmedAccount = false;

    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
        ClockSkew = TimeSpan.Zero
    };
});

// Configure Authorization Policies
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("SiteAdmin", policy =>
        policy.RequireRole("SiteAdmin"))
    .AddPolicy("MudAdmin", policy =>
        policy.RequireRole("MudAdmin", "SiteAdmin"))
    .AddPolicy("Player", policy =>
        policy.RequireRole("Player", "MudAdmin", "SiteAdmin"));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? ["http://localhost:5173"];

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure OpenAPI/Swagger
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }))
   .WithName("HealthCheck")
   .WithTags("Health");

app.Run();
