using MediatR;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Reviews.Commands;

/// <summary>
/// Command to delete an admin reply from a review.
/// </summary>
public record DeleteAdminReplyCommand(
    Guid ReviewId,
    Guid AdminUserId
) : IRequest<bool>;

public class DeleteAdminReplyCommandHandler : IRequestHandler<DeleteAdminReplyCommand, bool>
{
    private readonly IReviewRepository _reviewRepository;

    public DeleteAdminReplyCommandHandler(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<bool> Handle(DeleteAdminReplyCommand request, CancellationToken cancellationToken)
    {
        var review = await _reviewRepository.GetByIdAsync(request.ReviewId, cancellationToken);
        if (review?.AdminReply == null) return false;

        await _reviewRepository.DeleteReplyAsync(request.ReviewId, cancellationToken);
        return true;
    }
}
