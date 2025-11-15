# Frontend Environment Variables

Create a `.env` file in the `web/` directory with the following variables:

```bash
# Google OAuth Client ID (same as backend)
VITE_GOOGLE_CLIENT_ID="your_google_client_id_here"

# API Base URL
VITE_API_URL="http://localhost:3000/api"
```

## How to Get Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (same one used for backend)
3. Go to "Credentials"
4. Copy the **Client ID** (same one you used in backend)
5. Make sure `http://localhost:5173` is in Authorized redirect URIs

## Development vs Production

### Development (local)
```bash
VITE_GOOGLE_CLIENT_ID="your_dev_client_id"
VITE_API_URL="http://localhost:3000/api"
```

### Production
```bash
VITE_GOOGLE_CLIENT_ID="your_prod_client_id"
VITE_API_URL="https://api.yourdomain.com/api"
```

## Important Notes

- The `VITE_` prefix is required for Vite to expose the variable to the client
- Never commit `.env` file to git
- Restart dev server after changing `.env` file

