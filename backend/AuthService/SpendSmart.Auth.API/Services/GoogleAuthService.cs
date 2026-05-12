namespace SpendSmart.Auth.API.Services;

using Google.Apis.Auth;
using Microsoft.IdentityModel.Tokens;
using SpendSmart.Auth.API.DTOs;
using SpendSmart.Auth.API.Models;
using SpendSmart.Auth.API.Repositories.Interfaces;
using SpendSmart.Auth.API.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

/// <summary>
/// Google OAuth authentication service
/// Validates Google ID tokens and manages user authentication/creation
/// </summary>
public class GoogleAuthService : IGoogleAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleAuthService> _logger;

    public GoogleAuthService(
        IUserRepository userRepository,
        IConfiguration configuration,
        ILogger<GoogleAuthService> logger)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Validates Google ID token and authenticates/creates user
    /// </summary>
    public async Task<LoginResponse> AuthenticateWithGoogleAsync(string idToken)
    {
        // Step 1: Validate Google ID token with the registered Client ID
        GoogleJsonWebSignature.Payload payload;
        try
        {
            var clientId = _configuration["Google:ClientId"]
                ?? throw new InvalidOperationException("Google:ClientId is not configured in appsettings.");

            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { clientId }
            };

            payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            if (payload == null)
                throw new InvalidOperationException("Failed to parse Google token payload.");
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogWarning("Google token validation failed: {Message}", ex.Message);
            throw new InvalidOperationException("Invalid Google ID token: " + ex.Message);
        }

        // Step 2: Extract user claims
        try
        {
            var googleId = payload.Subject;
            if (string.IsNullOrEmpty(googleId))
                throw new InvalidOperationException("Google ID (sub) not found in token.");

            var email = payload.Email;
            if (string.IsNullOrEmpty(email))
                throw new InvalidOperationException("Email not found in Google token. Ensure the 'email' scope is included.");

            var fullName = payload.Name ?? email.Split('@')[0];

            // Step 3: Find or create user
            var user = await _userRepository.GetUserByGoogleIdAsync(googleId);

            if (user == null)
            {
                user = await _userRepository.GetUserByEmailAsync(email);

                if (user == null)
                {
                    user = new User
                    {
                        FullName = fullName,
                        Email = email,
                        GoogleId = googleId,
                        PasswordHash = string.Empty,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _userRepository.CreateUserAsync(user);
                    _logger.LogInformation("New user created via Google OAuth: {Email}", email);
                }
                else
                {
                    user.GoogleId = googleId;
                    await _userRepository.UpdateUserAsync(user);
                    _logger.LogInformation("GoogleId linked to existing user: {Email}", email);
                }
            }

            user.LastLoginAt = DateTime.UtcNow;
            await _userRepository.UpdateUserAsync(user);

            var jwtToken = GenerateJwtToken(user);

            return new LoginResponse
            {
                Token = jwtToken,
                User = new UserResponse
                {
                    UserId = user.UserId,
                    FullName = user.FullName,
                    Email = user.Email,
                    Currency = user.Currency
                }
            };
        }
        catch (InvalidOperationException)
        {
            throw; // rethrow as-is — message is already descriptive
        }
        catch (Exception ex)
        {
            _logger.LogError("Google authentication error: {Message}", ex.Message);
            throw new InvalidOperationException("Google authentication failed: " + ex.Message);
        }
    }

    /// <summary>
    /// Generates JWT token for authenticated user
    /// </summary>
    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"] 
                ?? throw new InvalidOperationException("Jwt:Key not configured")));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "1440")),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
