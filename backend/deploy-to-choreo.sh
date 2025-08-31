#!/bin/bash

# Deployment script for Choreo
echo "Preparing for Choreo deployment..."

# Check if Config.toml.choreo exists
if [ ! -f "Config.toml.choreo" ]; then
    echo "Error: Config.toml.choreo not found!"
    exit 1
fi

# Copy Choreo config to Config.toml
echo "Using Choreo configuration..."
cp Config.toml.choreo Config.toml

# Ensure Dockerfile.choreo is used
if [ -f "Dockerfile.choreo" ]; then
    echo "Using Choreo Dockerfile..."
    cp Dockerfile.choreo Dockerfile
fi

echo "Ready for Choreo deployment!"
echo ""
echo "Next steps:"
echo "1. Commit and push your code to GitHub"
echo "2. In Choreo, go to your component's 'Deploy' section"
echo "3. Add all required environment variables in 'Configs & Secrets'"
echo "4. Deploy your component"
echo ""
echo "Remember to mark these as SECRETS in Choreo:"
echo "- DB_PASSWORD"
echo "- GEMINI_API_KEY"
echo "- GOOGLE_VISION_API_KEY"
echo "- ASGARDEO_CLIENT_SECRET"
echo "- JWT_SECRET"