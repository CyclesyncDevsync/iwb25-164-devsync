# How to Get Google Calendar OAuth2 Credentials

## Step 1: Create OAuth2 Credentials in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **cyclesync-474212**
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: **External** (or Internal if using Google Workspace)
   - Fill in required fields (App name, user support email, developer contact)
   - Add your email to test users
6. Choose Application type: **Web application**
7. Add Authorized redirect URIs:
   - `http://localhost:9090/callback`
   - `https://developers.google.com/oauthplayground`
8. Click **CREATE**
9. **Save** the Client ID and Client Secret

## Step 2: Get Refresh Token using OAuth Playground

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the **⚙️ Settings** icon (top right)
3. Check **"Use your own OAuth credentials"**
4. Enter your:
   - **OAuth Client ID**: (from Step 1)
   - **OAuth Client Secret**: (from Step 1)
5. Close settings
6. In **Step 1**, find and select:
   - **Calendar API v3** → `https://www.googleapis.com/auth/calendar`
7. Click **Authorize APIs**
8. Sign in with your Google account
9. Allow the requested permissions
10. In **Step 2**, click **Exchange authorization code for tokens**
11. **Copy the Refresh token** (you'll need this!)

## Step 3: Update Config.toml

Replace the placeholders in `Config.toml` with your actual values:

```toml
[hp.Cyclesync.google_calendar]
clientId = "123456789-abcdefg.apps.googleusercontent.com"  # From Step 1
clientSecret = "GOCSPX-your-client-secret-here"             # From Step 1
refreshToken = "1//0example-refresh-token"                   # From Step 2
calendarId = "beebed8c52807211f30712f048b6b06df5da13d0532c6a1bbb932e7b8d7fcff2@group.calendar.google.com"
```

## Step 4: Ensure Calendar API is Enabled

1. In Google Cloud Console, go to **APIs & Services** → **Enabled APIs & services**
2. If Google Calendar API is not listed, click **+ ENABLE APIS AND SERVICES**
3. Search for "Google Calendar API"
4. Click **ENABLE**

## Step 5: Share Calendar with OAuth Account

1. Go to [Google Calendar](https://calendar.google.com)
2. Find "Cyclesync Orders" calendar in the left sidebar
3. Click the three dots → **Settings and sharing**
4. Under **Share with specific people**, add the email you used for OAuth
5. Give it **Make changes to events** permission
6. Click **Send**

## Step 6: Test the Integration

1. Start the backend: `bal run`
2. The calendar service should initialize successfully
3. Test creating an event using the PowerShell script: `.\test-calendar.ps1`

---

## Troubleshooting

### "Invalid refresh token"
- The refresh token might have expired
- Go back to OAuth Playground and generate a new one

### "Calendar not found"
- Make sure the calendar is shared with your OAuth account
- Verify the calendar ID is correct

### "Insufficient permissions"
- Make sure you selected the full Calendar API scope
- Re-authorize in OAuth Playground

---

## Security Notes

⚠️ **Never commit OAuth credentials to Git!**

Add to `.gitignore`:
```
Config.toml
*.json
```

The refresh token gives full access to the calendar - keep it secure!
