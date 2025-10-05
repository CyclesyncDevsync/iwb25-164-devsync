# Choreo Docker Build Configuration - URGENT ACTION REQUIRED

## Problem Summary
Choreo is auto-detecting the frontend as a static Node.js website and using an nginx buildpack instead of your custom Dockerfile. This causes the build to fail because:

1. Your Dockerfile uses Next.js `output: "standalone"` which creates `.next` directory
2. Choreo's auto-generated nginx Dockerfile expects `/app/out` or `/app/build` (static export)
3. No amount of configuration files will override Choreo's initial buildpack selection

## Evidence
Error logs show Choreo is using:
- Base image: `choreoanonymouspullable.azurecr.io/nginxinc/nginx-unprivileged:stable-alpine-slim`
- Looking for: `/app/out` or `/app/build`
- Using: Auto-generated 13-step Dockerfile (not your custom 49-line Dockerfile)

## What We've Done (Repository Side)
✅ Created `.choreo/` directory with:
   - `component.yaml` - Specifies build configuration
   - `endpoints.yaml` - Defines port 3000
   - `Dockerfile` - Copy of your custom Next.js Dockerfile
   - `buildpack` - Contains "docker" to hint at buildpack
   - `BUILD_TYPE_DOCKER` - Additional marker file

✅ Updated `component.yaml` in root with Docker build specification

✅ Created `.buildpacks` file with "docker"

## What YOU Must Do (Platform Side)

### CRITICAL: Change Buildpack in Choreo Dashboard

Since Choreo makes buildpack decisions at the **platform level** (not repository level), you MUST manually configure it:

### Option 1: Update Existing Component (Preferred)

1. **Log in to Choreo Console**: https://console.choreo.dev

2. **Navigate to your frontend component**:
   - Go to your project/organization
   - Find "CycleSync Frontend" or similar component name

3. **Access Component Settings**:
   - Click on "Settings" or "Configure" 
   - Look for "Build Configuration" or "Build Settings"

4. **Change Build Type**:
   - Find dropdown labeled "Build Pack", "Build Type", or "Deployment Method"
   - **Change from**: "Node.js", "Static", or "Web Application"
   - **Change to**: "Docker", "Dockerfile", or "Container"

5. **Specify Dockerfile Location**:
   - Dockerfile path: `./Dockerfile` OR `./.choreo/Dockerfile`
   - Build context: `.` (current directory)
   - Base path: `/frontend` (if component is in subdirectory)

6. **Clear Build Cache**:
   - Look for "Clear Cache" or "Rebuild from Scratch" option
   - Enable it before next deployment

7. **Save and Redeploy**:
   - Save settings
   - Trigger a new build/deployment

### Option 2: Recreate Component (If settings locked)

If you can't change buildpack on existing component:

1. **Delete current frontend component** (backup environment variables first!)

2. **Create new component**:
   - Click "Add Component" or "New Component"
   - Select repository: `CyclesyncDevsync/Cyclesync`
   - Branch: `dev`
   - **Component Type**: Select **"Dockerfile"** or **"Docker Container"** (NOT "Web Application")
   - Component path: `/frontend`
   - Dockerfile path: `./Dockerfile`

3. **Configure endpoints**:
   - Port: 3000
   - Type: HTTP
   - Visibility: Public

4. **Add environment variables** (copy from old component)

5. **Deploy**

### Option 3: Use Choreo CLI (If Available)

If Choreo provides a CLI tool:

```bash
# Login
choreo login

# Update component buildpack
choreo component update <component-id> \
  --buildpack=docker \
  --dockerfile=./Dockerfile \
  --build-context=.

# Or recreate
choreo component create \
  --name="cyclesync-frontend" \
  --type=docker \
  --dockerfile=./Dockerfile \
  --repo=CyclesyncDevsync/Cyclesync \
  --branch=dev \
  --path=/frontend
```

## Alternative Workaround (NOT RECOMMENDED)

If you absolutely cannot change the Choreo buildpack setting, you could modify your app to work with static export, but **this will break SSR and API routes**:

1. Change `next.config.ts`:
   ```typescript
   output: "export"  // instead of "standalone"
   ```

2. Remove all API routes from `src/app/api/`

3. Convert all server components to client components

4. Remove all server-side features (SSR, ISR, etc.)

**This is NOT recommended** as it defeats the purpose of using Next.js.

## Verification

After changing to Docker buildpack, you should see in build logs:

✅ Using your Dockerfile (FROM node:18-alpine AS builder)
✅ Installing dependencies with `npm ci`
✅ Building with `npm run build`
✅ Creating `.next/standalone` output
✅ Multi-stage build with Node.js (not nginx)
✅ Starting with `CMD ["node", "server.js"]`

❌ NOT using nginx base image
❌ NOT looking for /app/build or /app/out
❌ NOT 13-step auto-generated Dockerfile

## Next Steps

1. **Immediately**: Access Choreo dashboard and change buildpack to Docker
2. **Redeploy**: Trigger new build after changing settings
3. **Verify**: Check build logs show your Dockerfile is being used
4. **Report back**: If issue persists after changing buildpack, there may be a Choreo bug

## Support

If you cannot find the buildpack setting in Choreo dashboard:
- Contact Choreo support team
- Provide this document and error logs
- Request manual buildpack change to "Docker" for frontend component

---

**Bottom Line**: The configuration files in your repository are correct. The issue is entirely on the Choreo platform side. You must manually change the component's buildpack setting from "Node.js/Static" to "Docker" in the Choreo dashboard.
