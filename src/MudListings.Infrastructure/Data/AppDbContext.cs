using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MudListings.Domain.Entities;
using MudListings.Domain.Enums;

namespace MudListings.Infrastructure.Data;

/// <summary>
/// Application database context with Identity support.
/// </summary>
public class AppDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Mud> Muds => Set<Mud>();
    public DbSet<MudGenre> MudGenres => Set<MudGenre>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<ReviewHelpful> ReviewHelpfuls => Set<ReviewHelpful>();
    public DbSet<ReviewReply> ReviewReplies => Set<ReviewReply>();
    public DbSet<ReviewReport> ReviewReports => Set<ReviewReport>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<ActivityEvent> ActivityEvents => Set<ActivityEvent>();
    public DbSet<MudAdmin> MudAdmins => Set<MudAdmin>();
    public DbSet<MudStatus> MudStatuses => Set<MudStatus>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure Mud entity
        ConfigureMud(builder);

        // Configure User entity
        ConfigureUser(builder);

        // Configure Review entity
        ConfigureReview(builder);

        // Configure join entities
        ConfigureJoinEntities(builder);

        // Configure other entities
        ConfigureOtherEntities(builder);

        // Apply global query filter for soft delete
        builder.Entity<Mud>().HasQueryFilter(m => !m.IsDeleted);
        builder.Entity<Review>().HasQueryFilter(r => !r.IsDeleted);
    }

    private static void ConfigureMud(ModelBuilder builder)
    {
        builder.Entity<Mud>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Slug)
                .IsRequired()
                .HasMaxLength(250);

            entity.Property(e => e.Description)
                .HasMaxLength(10000);

            entity.Property(e => e.ShortDescription)
                .HasMaxLength(500);

            entity.Property(e => e.Website)
                .HasMaxLength(500);

            entity.Property(e => e.DiscordUrl)
                .HasMaxLength(500);

            entity.Property(e => e.WikiUrl)
                .HasMaxLength(500);

            entity.Property(e => e.Codebase)
                .HasMaxLength(200);

            entity.Property(e => e.Language)
                .HasMaxLength(50);

            // Configure owned type: ConnectionInfo
            entity.OwnsOne(e => e.Connection, conn =>
            {
                conn.Property(c => c.Host)
                    .HasMaxLength(255)
                    .HasColumnName("ConnectionHost");

                conn.Property(c => c.Port)
                    .HasColumnName("ConnectionPort");

                conn.Property(c => c.WebClientUrl)
                    .HasMaxLength(500)
                    .HasColumnName("WebClientUrl");
            });

            // Configure owned type: Rating
            entity.OwnsOne(e => e.AggregateRating, rating =>
            {
                rating.Property(r => r.Average)
                    .HasColumnName("RatingAverage");

                rating.Property(r => r.Count)
                    .HasColumnName("RatingCount");
            });

            // Configure owned type: MsspData (stored as JSON)
            entity.OwnsOne(e => e.CurrentMsspData, mssp =>
            {
                mssp.ToJson();
            });

            // Indexes for search optimization
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasIndex(e => e.IsOnline);
            entity.HasIndex(e => e.IsFeatured);
            entity.HasIndex(e => e.TrendingScore);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.IsDeleted);

            // Composite index for common search patterns
            entity.HasIndex(e => new { e.IsDeleted, e.IsOnline, e.TrendingScore });
        });
    }

    private static void ConfigureUser(ModelBuilder builder)
    {
        builder.Entity<User>(entity =>
        {
            entity.Property(e => e.DisplayName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.AvatarUrl)
                .HasMaxLength(500);

            entity.Property(e => e.Bio)
                .HasMaxLength(2000);

            entity.HasIndex(e => e.DisplayName);
        });
    }

    private static void ConfigureReview(ModelBuilder builder)
    {
        builder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Title)
                .HasMaxLength(200);

            entity.Property(e => e.Body)
                .IsRequired()
                .HasMaxLength(10000);

            entity.Property(e => e.Rating)
                .IsRequired();

            entity.HasOne(e => e.Mud)
                .WithMany(m => m.Reviews)
                .HasForeignKey(e => e.MudId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // One review per user per MUD
            entity.HasIndex(e => new { e.MudId, e.UserId }).IsUnique();

            entity.HasIndex(e => e.Rating);
            entity.HasIndex(e => e.HelpfulCount);
            entity.HasIndex(e => e.CreatedAt);
        });

        builder.Entity<ReviewReply>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Body)
                .IsRequired()
                .HasMaxLength(5000);

            entity.HasOne(e => e.Review)
                .WithOne(r => r.AdminReply)
                .HasForeignKey<ReviewReply>(e => e.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.AdminUser)
                .WithMany()
                .HasForeignKey(e => e.AdminUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ReviewReport>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Reason)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Details)
                .HasMaxLength(2000);

            entity.Property(e => e.Resolution)
                .HasMaxLength(2000);

            entity.HasOne(e => e.Review)
                .WithMany(r => r.Reports)
                .HasForeignKey(e => e.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Reporter)
                .WithMany()
                .HasForeignKey(e => e.ReporterId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ResolvedByUser)
                .WithMany()
                .HasForeignKey(e => e.ResolvedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.Status);
        });
    }

    private static void ConfigureJoinEntities(ModelBuilder builder)
    {
        // MudGenre - Many-to-many between Mud and Genre
        builder.Entity<MudGenre>(entity =>
        {
            entity.HasKey(e => new { e.MudId, e.Genre });

            entity.HasOne(e => e.Mud)
                .WithMany(m => m.MudGenres)
                .HasForeignKey(e => e.MudId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.Genre);
        });

        // ReviewHelpful - Many-to-many between Review and User
        builder.Entity<ReviewHelpful>(entity =>
        {
            entity.HasKey(e => new { e.ReviewId, e.UserId });

            entity.HasOne(e => e.Review)
                .WithMany(r => r.HelpfulVotes)
                .HasForeignKey(e => e.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.HelpfulVotes)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Favorite - Many-to-many between User and Mud
        builder.Entity<Favorite>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.MudId });

            entity.HasOne(e => e.User)
                .WithMany(u => u.Favorites)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Mud)
                .WithMany(m => m.Favorites)
                .HasForeignKey(e => e.MudId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.CreatedAt);
        });
    }

    private static void ConfigureOtherEntities(ModelBuilder builder)
    {
        // ActivityEvent
        builder.Entity<ActivityEvent>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Description)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(e => e.MetadataJson)
                .HasMaxLength(4000);

            entity.HasOne(e => e.User)
                .WithMany(u => u.ActivityEvents)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Mud)
                .WithMany(m => m.ActivityEvents)
                .HasForeignKey(e => e.MudId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.Type);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.MudId, e.CreatedAt });
        });

        // MudAdmin
        builder.Entity<MudAdmin>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.VerificationCode)
                .HasMaxLength(100);

            entity.HasOne(e => e.Mud)
                .WithMany(m => m.Admins)
                .HasForeignKey(e => e.MudId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.ManagedMuds)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.InvitedByUser)
                .WithMany()
                .HasForeignKey(e => e.InvitedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // One admin record per user per MUD
            entity.HasIndex(e => new { e.MudId, e.UserId }).IsUnique();
            entity.HasIndex(e => e.IsVerified);
        });

        // MudStatus
        builder.Entity<MudStatus>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.MsspDataJson)
                .HasMaxLength(4000);

            entity.HasOne(e => e.Mud)
                .WithMany(m => m.StatusHistory)
                .HasForeignKey(e => e.MudId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.CheckedAt);
            entity.HasIndex(e => new { e.MudId, e.CheckedAt });
        });

        // AuditLog
        builder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Action)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.TargetType)
                .HasMaxLength(100);

            entity.Property(e => e.Details)
                .HasMaxLength(4000);

            entity.Property(e => e.IpAddress)
                .HasMaxLength(45);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.Action);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.TargetType, e.TargetId });
        });
    }

    public override int SaveChanges()
    {
        UpdateAuditFields();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditFields()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State is EntityState.Added or EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Entity is Domain.Common.BaseEntity baseEntity)
            {
                baseEntity.UpdatedAt = DateTime.UtcNow;

                if (entry.State == EntityState.Added)
                {
                    baseEntity.CreatedAt = DateTime.UtcNow;
                }
            }

            // Handle User entity separately since it doesn't inherit from BaseEntity
            if (entry.Entity is User user)
            {
                user.UpdatedAt = DateTime.UtcNow;

                if (entry.State == EntityState.Added)
                {
                    user.CreatedAt = DateTime.UtcNow;
                }
            }
        }
    }
}
