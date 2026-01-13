#!/bin/bash
# scripts/deploy.sh - Manual deployment script

set -e

echo "🚀 Starting deployment to Fly.io..."

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl CLI not found. Install it first:"
    echo "curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Build the application locally
echo "📦 Building application..."
npm run build

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Deploy to Fly.io
echo "🚢 Deploying to Fly.io..."
flyctl deploy

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://soro-care.fly.dev"

# ---

#!/bin/bash
# scripts/setup-production.sh - Initial production setup

set -e

echo "🔧 Setting up SORO for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Build application
echo "🏗️  Building application..."
npm run build

echo "✅ Production setup complete!"

# ---

#!/bin/bash
# scripts/create-secrets.sh - Generate secure secrets

echo "🔐 Generating secure secrets for production..."

echo ""
echo "Add these to your Fly.io secrets:"
echo ""

echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)"

echo ""
echo "To set secrets in Fly.io, run:"
echo "flyctl secrets set JWT_SECRET=your_secret_here"
echo "flyctl secrets set JWT_REFRESH_SECRET=your_refresh_secret_here"