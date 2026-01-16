namespace MudListings.Application.Interfaces;

/// <summary>
/// Service for sending emails.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an email verification link to the user.
    /// </summary>
    Task SendEmailVerificationAsync(string email, string displayName, string verificationLink);

    /// <summary>
    /// Sends a password reset link to the user.
    /// </summary>
    Task SendPasswordResetAsync(string email, string displayName, string resetLink);

    /// <summary>
    /// Sends a welcome email after successful registration.
    /// </summary>
    Task SendWelcomeEmailAsync(string email, string displayName);

    /// <summary>
    /// Sends a generic email.
    /// </summary>
    Task SendEmailAsync(string to, string subject, string htmlBody, string? textBody = null);
}
