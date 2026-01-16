using MediatR;
using MudListings.Application.DTOs.Admin;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.Admin.Commands;

/// <summary>
/// Command to moderate reported content.
/// </summary>
public record ModerateContentCommand(
    Guid ReportId,
    Guid ModeratorUserId,
    ModerationAction Action,
    string? Resolution
) : IRequest<ModerateContentResult>;

public record ModerateContentResult(
    bool Success,
    string Message
);

public class ModerateContentCommandHandler : IRequestHandler<ModerateContentCommand, ModerateContentResult>
{
    private readonly IAdminRepository _adminRepository;
    private readonly IReviewRepository _reviewRepository;

    public ModerateContentCommandHandler(
        IAdminRepository adminRepository,
        IReviewRepository reviewRepository)
    {
        _adminRepository = adminRepository;
        _reviewRepository = reviewRepository;
    }

    public async Task<ModerateContentResult> Handle(ModerateContentCommand request, CancellationToken cancellationToken)
    {
        var report = await _adminRepository.GetReportByIdAsync(request.ReportId, cancellationToken);
        if (report == null)
        {
            return new ModerateContentResult(false, "Report not found.");
        }

        if (report.Status != ReviewReportStatus.Pending)
        {
            return new ModerateContentResult(false, "Report has already been resolved.");
        }

        // Update report status based on action
        switch (request.Action)
        {
            case ModerationAction.Approve:
                report.Status = ReviewReportStatus.Rejected; // Report was invalid
                break;

            case ModerationAction.HideReview:
                report.Status = ReviewReportStatus.ReviewHidden;
                // Hide the review
                if (report.Review != null)
                {
                    report.Review.IsHidden = true;
                    await _reviewRepository.UpdateAsync(report.Review, cancellationToken);
                }
                break;

            case ModerationAction.DeleteReview:
                report.Status = ReviewReportStatus.ReviewDeleted;
                // Soft delete the review
                if (report.Review != null)
                {
                    await _reviewRepository.DeleteAsync(report.ReviewId, cancellationToken);
                }
                break;

            default:
                return new ModerateContentResult(false, "Invalid moderation action.");
        }

        report.ResolvedAt = DateTime.UtcNow;
        report.ResolvedByUserId = request.ModeratorUserId;
        report.Resolution = request.Resolution;

        await _adminRepository.UpdateReportAsync(report, cancellationToken);

        // Create audit log
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Moderation:{request.Action}",
            UserId = request.ModeratorUserId,
            TargetType = "Review",
            TargetId = report.ReviewId,
            Details = $"Report ID: {request.ReportId}. Resolution: {request.Resolution}",
            CreatedAt = DateTime.UtcNow
        };

        await _adminRepository.CreateAuditLogAsync(auditLog, cancellationToken);

        var actionMessage = request.Action switch
        {
            ModerationAction.Approve => "Report dismissed, review remains visible.",
            ModerationAction.HideReview => "Review has been hidden.",
            ModerationAction.DeleteReview => "Review has been deleted.",
            _ => "Action completed."
        };

        return new ModerateContentResult(true, actionMessage);
    }
}
