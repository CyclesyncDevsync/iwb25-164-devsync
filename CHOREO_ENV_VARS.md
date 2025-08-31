# Environment Variables for Choreo Deployment

Copy these environment variables to your Choreo Console under **Configure → Environment Variables**:

## Database Configuration
- `DB_HOST`: Your PostgreSQL host (e.g., `your-db.postgres.database.azure.com`)
- `DB_PORT`: `5432`
- `DB_USERNAME`: Your database username
- `DB_PASSWORD`: Your database password
- `DB_NAME`: `cyclesync_db`

## API Keys
- `GEMINI_API_KEY`: Your Google Gemini API key
- `GOOGLE_VISION_API_KEY`: Your Google Vision API key

## Asgardeo OAuth Configuration
- `ASGARDEO_BASE_URL`: `https://api.asgardeo.io/t/org3hyzl`
- `ASGARDEO_CLIENT_ID`: `1BHltIqFq3i3x46ee8yFW37MVawa`
- `ASGARDEO_CLIENT_SECRET`: `KrhzA5PGfvATBHXmUlMf16VugUNfYvHjqFfjdoTJ6_oa`
- `ASGARDEO_REDIRECT_URI`: `https://your-frontend.choreo.dev/api/auth/callback`

## Security
- `JWT_SECRET`: Generate a secure secret (e.g., `openssl rand -base64 32`)

## Redis Configuration (Optional)
- `REDIS_HOST`: Your Redis host (leave empty if not using)
- `REDIS_PORT`: `6379`
- `REDIS_PASSWORD`: Your Redis password

## Application URLs
- `FRONTEND_URL`: `https://your-frontend.choreo.dev`
- `BACKEND_URL`: `https://your-backend.choreo.dev`
- `ENVIRONMENT`: `production` (or `development` for dev deployment)

## Important Notes:

1. **Database SSL**: Ensure your database connection uses SSL in production
2. **Secrets**: Mark sensitive variables (passwords, API keys) as "Secret" in Choreo
3. **URLs**: Update all URLs to match your Choreo deployment URLs
4. **Asgardeo Redirect**: Update the redirect URI in Asgardeo console to match Choreo URL

## Frontend Environment Variables

For your Next.js frontend, create these in Vercel/Netlify or your frontend hosting:

```env
NEXT_PUBLIC_API_URL=https://your-backend.choreo.dev/api
NEXT_PUBLIC_AUTH_API_URL=https://your-backend.choreo.dev/auth
NEXT_PUBLIC_ADMIN_API_URL=https://your-backend.choreo.dev/admin
NEXT_PUBLIC_DEMAND_API_URL=https://your-backend.choreo.dev/demand
NEXT_PUBLIC_QUALITY_API_URL=https://your-backend.choreo.dev/quality
NEXT_PUBLIC_PRICING_API_URL=https://your-backend.choreo.dev/pricing
NEXT_PUBLIC_AUCTION_API_URL=https://your-backend.choreo.dev/auction
NEXT_PUBLIC_WALLET_API_URL=https://your-backend.choreo.dev/wallet
NEXT_PUBLIC_CHATBOT_WS_URL=wss://your-backend.choreo.dev/ws
NEXT_PUBLIC_CHATBOT_HEALTH_URL=https://your-backend.choreo.dev/health

NEXT_PUBLIC_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/org3hyzl
NEXT_PUBLIC_ASGARDEO_CLIENT_ID=1BHltIqFq3i3x46ee8yFW37MVawa
NEXT_PUBLIC_ASGARDEO_REDIRECT_URI=https://your-frontend.choreo.dev/api/auth/callback
```