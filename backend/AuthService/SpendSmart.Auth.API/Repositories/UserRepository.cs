using Microsoft.EntityFrameworkCore;
using SpendSmart.Auth.API.Data;
using SpendSmart.Auth.API.Models;
using SpendSmart.Auth.API.Repositories.Interfaces;

namespace SpendSmart.Auth.API.Repositories;

/// <summary>
/// Repository implementation for User entity operations.
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="UserRepository"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets a user by email address asynchronously.
    /// </summary>
    /// <param name="email">The email address to search for.</param>
    /// <returns>The user if found; otherwise null.</returns>
    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    /// <summary>
    /// Gets a user by user ID asynchronously.
    /// </summary>
    /// <param name="userId">The user ID to search for.</param>
    /// <returns>The user if found; otherwise null.</returns>
    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
    }

    /// <summary>
    /// Creates a new user asynchronously.
    /// </summary>
    /// <param name="user">The user to create.</param>
    /// <returns>The created user with generated ID.</returns>
    public async Task<User> CreateUserAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    /// <summary>
    /// Updates an existing user asynchronously.
    /// </summary>
    /// <param name="user">The user to update.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task UpdateUserAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Gets a user by Google ID asynchronously.
    /// </summary>
    /// <param name="googleId">The Google ID to search for.</param>
    /// <returns>The user if found; otherwise null.</returns>
    public async Task<User?> GetUserByGoogleIdAsync(string googleId)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
    }
}
