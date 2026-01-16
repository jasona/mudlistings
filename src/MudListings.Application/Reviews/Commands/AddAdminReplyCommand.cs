using MediatR;
using MudListings.Application.Interfaces;
using MudListings.Domain.Entities;

namespace MudListings.Application.Reviews.Commands;

/// <summary>
/// Command to add or update an admin reply to a review.
/// </summary>
public record AddAdminReplyCommand(
    Guid ReviewId,
    Guid AdminUserId,
    string Body
) : IRequest<Guid?>;

public class AddAdminReplyCommandHandler : IRequestHandler<AddAdminReplyCommand, Guid?>
{
    private readonly IReviewRepository _reviewRepository;

    public AddAdminReplyCommandHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<Guid?> Handle(AddAdminReplyCommand request, CancellationToken cancellationToken)
    {
        var review = await _reviewRepository.GetByIdAsync(request.ReviewId, cancellationToken);
        if (review == null) return null;

        Guid replyId;

        // Check if reply already exists
        if (review.AdminReply != null)
        {
            // Update existing reply
            review.AdminReply.Body = request.Body;
            review.AdminReply.UpdatedAt = DateTime.UtcNow;
            await _reviewRepository.UpdateReplyAsync(review.AdminReply, cancellationToken);
            replyId = review.AdminReply.Id;
        }
        else
        {
            // Create new reply
            replyId = Guid.NewGuid();
            var reply = new ReviewReply
            {
                Id = replyId,
                ReviewId = request.ReviewId,
                AdminUserId = request.AdminUserId,
                Body = request.Body,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _reviewRepository.AddReplyAsync(reply, cancellationToken);
        }

        return replyId;
    }
}
