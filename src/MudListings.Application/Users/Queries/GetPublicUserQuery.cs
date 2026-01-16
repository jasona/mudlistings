using MediatR;
using MudListings.Application.DTOs.Users;

namespace MudListings.Application.Users.Queries;

public record GetPublicUserQuery(Guid UserId) : IRequest<PublicUserProfileDto?>;
