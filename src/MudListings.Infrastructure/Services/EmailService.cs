using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MudListings.Application.Interfaces;

namespace MudListings.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _fromEmail = configuration["Email:FromEmail"] ?? "noreply@mudlistings.com";
        _fromName = configuration["Email:FromName"] ?? "MudListings";
    }

    public async Task SendEmailVerificationAsync(string email, string displayName, string verificationLink)
    {
        var subject = "Verify your MudListings email";
        var htmlBody = $@"
            <h2>Welcome to MudListings, {displayName}!</h2>
            <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
            <p><a href=""{verificationLink}"" style=""background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;"">Verify Email</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p>{verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account on MudListings, you can safely ignore this email.</p>
            <br>
            <p>Happy adventuring!</p>
            <p>The MudListings Team</p>
        ";

        await SendEmailAsync(email, subject, htmlBody);
    }

    public async Task SendPasswordResetAsync(string email, string displayName, string resetLink)
    {
        var subject = "Reset your MudListings password";
        var htmlBody = $@"
            <h2>Password Reset Request</h2>
            <p>Hi {displayName},</p>
            <p>We received a request to reset your password. Click the link below to set a new password:</p>
            <p><a href=""{resetLink}"" style=""background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;"">Reset Password</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p>{resetLink}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            <br>
            <p>The MudListings Team</p>
        ";

        await SendEmailAsync(email, subject, htmlBody);
    }

    public async Task SendWelcomeEmailAsync(string email, string displayName)
    {
        var subject = "Welcome to MudListings!";
        var htmlBody = $@"
            <h2>Welcome to MudListings, {displayName}!</h2>
            <p>Your email has been verified and your account is now fully activated.</p>
            <p>You can now:</p>
            <ul>
                <li>Browse and discover MUD games</li>
                <li>Write reviews and rate games</li>
                <li>Save your favorite MUDs</li>
                <li>Claim and manage your own MUD listings</li>
            </ul>
            <p>Start exploring: <a href=""https://mudlistings.com"">mudlistings.com</a></p>
            <br>
            <p>Happy adventuring!</p>
            <p>The MudListings Team</p>
        ";

        await SendEmailAsync(email, subject, htmlBody);
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody, string? textBody = null)
    {
        // In development, just log the email
        // In production, integrate with SendGrid, SMTP, or another email provider

        var emailProvider = _configuration["Email:Provider"] ?? "console";

        switch (emailProvider.ToLower())
        {
            case "sendgrid":
                await SendViaSendGridAsync(to, subject, htmlBody, textBody);
                break;
            case "smtp":
                await SendViaSmtpAsync(to, subject, htmlBody, textBody);
                break;
            case "console":
            default:
                LogEmailToConsole(to, subject, htmlBody);
                break;
        }
    }

    private Task SendViaSendGridAsync(string to, string subject, string htmlBody, string? textBody)
    {
        // TODO: Implement SendGrid integration
        // var apiKey = _configuration["Email:SendGrid:ApiKey"];
        // var client = new SendGridClient(apiKey);
        // var msg = MailHelper.CreateSingleEmail(
        //     new EmailAddress(_fromEmail, _fromName),
        //     new EmailAddress(to),
        //     subject,
        //     textBody,
        //     htmlBody);
        // await client.SendEmailAsync(msg);

        _logger.LogInformation("SendGrid email would be sent to {To}: {Subject}", to, subject);
        return Task.CompletedTask;
    }

    private Task SendViaSmtpAsync(string to, string subject, string htmlBody, string? textBody)
    {
        // TODO: Implement SMTP integration
        // var smtpHost = _configuration["Email:Smtp:Host"];
        // var smtpPort = int.Parse(_configuration["Email:Smtp:Port"] ?? "587");
        // var smtpUser = _configuration["Email:Smtp:Username"];
        // var smtpPass = _configuration["Email:Smtp:Password"];

        _logger.LogInformation("SMTP email would be sent to {To}: {Subject}", to, subject);
        return Task.CompletedTask;
    }

    private void LogEmailToConsole(string to, string subject, string htmlBody)
    {
        _logger.LogInformation(
            "Email to: {To}\nSubject: {Subject}\nBody:\n{Body}",
            to, subject, htmlBody);
    }
}
