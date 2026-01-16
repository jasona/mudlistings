using MediatR;
using MudListings.Application.DTOs.Users;

namespace MudListings.Application.Users.Queries;

public record GetCurrentUserQuery(Guid UserId) : IRequest<UserProfileDto?>;
