using MediatR;
using MudListings.Application.DTOs.Users;
using MudListings.Application.Interfaces;

namespace MudListings.Application.Users.Queries;

public class GetPublicUserQueryHandler : IRequestHandler<GetPublicUserQuery, PublicUserProfileDto?>
{
    private readonly IUserProfileRepository _userProfileRepository;

    public GetPublicUserQueryHandler(IUserProfileRepository userProfileRepository)
    {
        _userProfileRepository = userProfileRepository;
    }

    public async Task<PublicUserProfileDto?> Handle(GetPublicUserQuery request, CancellationToken cancellationToken)
    {
        return await _userProfileRepository.GetPublicProfileAsync(request.UserId, cancellationToken);
    }
}
