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
        try
        {
            // Validate Google ID token
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken);

            if (payload == null)
            {
                throw new InvalidOperationException("Failed to parse Google token payload");
            }

            // Extract user info from token
            var googleId = payload.Subject;
            if (string.IsNullOrEmpty(googleId))
            {
                throw new InvalidOperationException("Google ID (sub) not found in token");
            }

            var email = payload.Email;
            if (string.IsNullOrEmpty(email))
            {
                throw new InvalidOperationException("Email not found in Google token. Ensure 'email' scope is included.");
            }

            var fullName = payload.Name ?? email.Split('@')[0]; // Fallback to username part of email

            // Check if user exists by GoogleId
            var user = await _userRepository.GetUserByGoogleIdAsync(googleId);

            if (user == null)
            {
                // Check if user exists by email (in case they sign up with email first)
                user = await _userRepository.GetUserByEmailAsync(email);

                if (user == null)
                {
                    // Create new user
                    user = new User
                    {
                        FullName = fullName,
                        Email = email,
                        GoogleId = googleId,
                        PasswordHash = string.Empty, // No password for OAuth users
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _userRepository.CreateUserAsync(user);
                    _logger.LogInformation($"New user created via Google OAuth: {email}");
                }
                else
                {
                    // Link GoogleId to existing email account
                    user.GoogleId = googleId;
                    await _userRepository.UpdateUserAsync(user);
                    _logger.LogInformation($"GoogleId linked to existing user: {email}");
                }
            }

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _userRepository.UpdateUserAsync(user);

            // Generate JWT token
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
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Invalid Google ID token: {ex.Message}");
            throw new InvalidOperationException("Invalid Google ID token");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Google authentication error: {ex.Message}");
            throw new InvalidOperationException("Google authentication failed");
        }
    }

    /// <summary>
    /// Generates JWT token for authenticated user
    /// </summary>
    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(
                _configuration["Jwt:SecretKey"] 
                ?? throw new InvalidOperationException("Jwt:SecretKey not configured")));

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
                int.Parse(_configuration["Jwt:TokenExpiryMinutes"] ?? "1440")),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
