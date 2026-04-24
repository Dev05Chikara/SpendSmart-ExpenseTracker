using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using SpendSmart.Auth.API.DTOs;
using SpendSmart.Auth.API.Models;
using SpendSmart.Auth.API.Repositories.Interfaces;
using SpendSmart.Auth.API.Services.Interfaces;

namespace SpendSmart.Auth.API.Services;

/// <summary>
/// Service implementation for user authentication and management operations.
/// </summary>
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenBlacklistRepository _tokenBlacklistRepository;
    private readonly PasswordHasher<User> _passwordHasher;
    private readonly IConfiguration _configuration;

    /// <summary>
    /// Initializes a new instance of the <see cref="UserService"/> class.
    /// </summary>
    /// <param name="userRepository">The user repository.</param>
    /// <param name="tokenBlacklistRepository">The token blacklist repository.</param>
    /// <param name="configuration">The configuration object for JWT settings.</param>
    public UserService(IUserRepository userRepository, ITokenBlacklistRepository tokenBlacklistRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _tokenBlacklistRepository = tokenBlacklistRepository;
        _passwordHasher = new PasswordHasher<User>();
        _configuration = configuration;
    }

    /// <summary>
    /// Registers a new user asynchronously.
    /// </summary>
    /// <param name="request">The registration request containing user details and password.</param>
    /// <returns>The created user as a UserResponse.</returns>
    public async Task<UserResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if email already exists
        var existingUser = await _userRepository.GetUserByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("Email already registered.");
        }

        // Create new user
        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            Currency = request.Currency,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Hash password
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        // Save user
        var createdUser = await _userRepository.CreateUserAsync(user);

        return MapToUserResponse(createdUser);
    }

    /// <summary>
    /// Authenticates a user and generates a JWT token asynchronously.
    /// </summary>
    /// <param name="request">The login request containing email and password.</param>
    /// <returns>The login response containing JWT token and user information.</returns>
    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        // Find user by email
        var user = await _userRepository.GetUserByEmailAsync(request.Email);
        if (user == null)
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        // Verify password
        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        // Check if account is active
        if (!user.IsActive)
        {
            throw new InvalidOperationException("Account has been deactivated. Please contact support.");
        }

        // Update last login time
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateUserAsync(user);

        // Generate JWT token
        var token = GenerateJwtToken(user);

        return new LoginResponse
        {
            Token = token,
            User = MapToUserResponse(user)
        };
    }

    /// <summary>
    /// Gets the user profile by user ID asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <returns>The user information as a UserResponse.</returns>
    public async Task<UserResponse> GetProfileAsync(int userId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        return MapToUserResponse(user);
    }

    /// <summary>
    /// Updates the user profile asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="request">The update request containing new full name and currency.</param>
    /// <returns>The updated user information as a UserResponse.</returns>
    public async Task<UserResponse> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        user.FullName = request.FullName;
        user.Currency = request.Currency;

        await _userRepository.UpdateUserAsync(user);

        return MapToUserResponse(user);
    }

    /// <summary>
    /// Changes the user password asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="request">The change password request containing old and new passwords.</param>
    /// <returns>A success message.</returns>
    public async Task<string> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        // Verify old password
        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.OldPassword);
        if (result == PasswordVerificationResult.Failed)
        {
            throw new InvalidOperationException("Old password is incorrect.");
        }

        // Hash new password
        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);

        await _userRepository.UpdateUserAsync(user);

        return "Password changed successfully.";
    }

    /// <summary>
    /// Deactivates a user account asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <returns>A success message.</returns>
    public async Task<string> DeactivateAsync(int userId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        user.IsActive = false;
        await _userRepository.UpdateUserAsync(user);

        return "Account deactivated successfully.";
    }

    /// <summary>
    /// Generates a JWT token for the user.
    /// </summary>
    /// <param name="user">The user to generate token for.</param>
    /// <returns>The JWT token as a string.</returns>
    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"];
        var jwtIssuer = _configuration["Jwt:Issuer"];
        var jwtAudience = _configuration["Jwt:Audience"];
        var expiryMinutes = int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "1440");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("FullName", user.FullName)
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Maps a User entity to a UserResponse DTO.
    /// </summary>
    /// <param name="user">The user entity.</param>
    /// <returns>The mapped UserResponse.</returns>
    private static UserResponse MapToUserResponse(User user)
    {
        return new UserResponse
        {
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            Currency = user.Currency,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }

    /// <summary>
    /// Logs out a user by blacklisting their JWT token asynchronously.
    /// </summary>
    public async Task<string> LogoutAsync(int userId, string token, DateTime expiresAt)
    {
        var tokenBlacklist = new TokenBlacklist
        {
            Token = token,
            UserId = userId,
            BlacklistedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt
        };

        await _tokenBlacklistRepository.AddTokenAsync(tokenBlacklist);
        return "Logged out successfully.";
    }
}
