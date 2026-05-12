# Google OAuth Authentication - Testing Guide

## Overview
The Auth API now supports Google OAuth (Sign with Google) authentication alongside traditional email/password login.

## Endpoint Details

### Google Auth Endpoint
- **URL**: `POST /api/users/google-auth`
- **Authentication**: None required (public endpoint)
- **Content-Type**: `application/json`

### Request Format
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiJ5b3VyLWNsaWVudC1pZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6InlvdXItY2xpZW50LWlkLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTIzNDU2Nzg5MCIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkpvaG4gRG9lIiwiZ2l2ZW5fbmFtZSI6IkpvaG4iLCJmYW1pbHlfbmFtZSI6IkRvZSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQVR6bS8xMjM0NTY3ODkwLWM3Yjc1NjdjMzM3L3Bob3RvLmpwZyIsImlhdCI6MTcwNTAwMDAwMCwiZXhwIjoxNzA1MDAzNjAwfQ.signature"
}
```

### Response Format (Success)
```json
{
  "success": true,
  "message": "Google authentication successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": 1,
      "fullName": "John Doe",
      "email": "user@gmail.com",
      "currency": "INR"
    }
  }
}
```

## Authentication Flow

### First-Time Google User
1. **New Account Creation**
   - System validates Google ID token with Google's servers
   - Creates new user account with:
     - Email from Google account
     - Full name from Google profile
     - GoogleId (unique identifier from Google)
     - Currency: INR (default)
     - IsActive: true

2. **JWT Token Generation**
   - Creates JWT token with:
     - NameIdentifier (UserId)
     - Email claim
     - Name claim
     - 24-hour expiration
     - HS256 signing algorithm

### Existing User (Email Previously Registered)
1. **Account Linking**
   - If email already exists (from traditional email/password signup)
   - Links GoogleId to existing account
   - No duplicate account created

2. **Login**
   - Authenticates via GoogleId
   - Updates LastLoginAt timestamp
   - Returns JWT token

### Existing User (Already Has GoogleId)
1. **Simple Authentication**
   - Validates GoogleId matches
   - Updates LastLoginAt timestamp
   - Returns new JWT token

## Testing with Postman

### Step 1: Get a Real Google ID Token
You must get an actual ID token from Google's authentication system. This cannot be faked for production systems.

#### Option A: Using Google OAuth Playground
1. Visit: https://developers.google.com/oauthplayground

2. In Step 1, select Google OAuth 2.0:
   - Select appropriate OAuth 2.0 scopes (e.g., `openid`, `email`)
   - Click "Authorize APIs"

3. Sign in with your Google account

4. In Step 2, exchange authorization code for tokens

5. Copy the `id_token` from the response

#### Option B: Using Frontend JavaScript
```javascript
// Install Google Sign-In library
<script src="https://accounts.google.com/gsi/client" async defer></script>

<div id="g_id_onload"
     data-client_id="YOUR_CLIENT_ID"
     data-callback="handleCredentialResponse">
</div>
<div class="g_id_signin" data-type="standard"></div>

<script>
function handleCredentialResponse(response) {
  const idToken = response.credential;
  console.log("ID Token:", idToken);
  // Send to /api/users/google-auth endpoint
}
</script>
```

### Step 2: Make the Request in Postman

1. Create new POST request to: `http://localhost:5184/api/users/google-auth`

2. Set Headers:
   ```
   Content-Type: application/json
   ```

3. Set Body (raw JSON):
   ```json
   {
     "idToken": "paste_your_google_id_token_here"
   }
   ```

4. Send and verify response includes JWT token

### Step 3: Use JWT Token for Protected Endpoints

Once you have the JWT token, use it for protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Example with `/api/users/profile`:
```
GET /api/users/profile
Authorization: Bearer <jwt_token_from_google_auth>
```

## Error Responses

### Invalid Token Format (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid Google ID token"
}
```

### Empty Token (400 Bad Request)
```json
{
  "success": false,
  "message": "ID token is required."
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "An error occurred during Google authentication."
}
```

## Important Notes

1. **Token Validation**: The system validates tokens using Google's public keys via `Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync()`

2. **Single Sign-On**: If user registers with email first, then uses Google OAuth later with same email, GoogleId gets linked to existing account

3. **No Duplicate Accounts**: System prevents duplicate accounts for same email address

4. **JWT Token Usage**: Google OAuth tokens are converted to JWT tokens for our API - all protected endpoints use our JWT tokens, not Google's

5. **Last Login Tracking**: Every authentication (email, password, or Google) updates the `LastLoginAt` field

6. **User Deactivation**: Deactivated accounts cannot login via any method

## Architecture

### Components
- **GoogleAuthService**: Validates Google tokens, manages user creation/linking
- **UsersController**: Exposes `/api/users/google-auth` endpoint
- **User Model**: Extended with `GoogleId` field for linking

### Database Changes
- Added `GoogleId` column (nvarchar(255), nullable)
- Added unique index on `GoogleId` (where GoogleId IS NOT NULL)
- Allows null for users who only use email/password

### Dependencies
- `Google.Apis.Auth` (v1.67.0) - For official Google token validation

## Security Considerations

1. **Token Validation**: Always validated server-side using Google's official library
2. **HTTPS Required**: In production, always use HTTPS (not implemented in dev)
3. **Token Expiration**: JWT tokens expire in 24 hours
4. **Logout**: Users can still use `/api/users/logout` to blacklist existing JWT tokens
5. **Email Verification**: Google automatically verifies emails, trusted as authoritative source

## Future Enhancements

1. **Multiple OAuth Providers**: Add Microsoft, GitHub, etc.
2. **Account Merging**: Allow users to link multiple OAuth providers to same account
3. **Profile Picture**: Store picture URL from Google profile
4. **OAuth Metadata Cache**: Cache Google's public keys for validation
5. **Rate Limiting**: Implement rate limiting on auth endpoints
