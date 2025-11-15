# Environment Variables

Create a `.env` file in the `api/` directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/crimson_club?schema=public"

# JWT
JWT_SECRET="your_jwt_secret_here_min_32_characters_random_string_please"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"

# Server
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"
```

## How to Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs: `http://localhost:5173` (for development)
7. Copy Client ID and Client Secret

## Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

