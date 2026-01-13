#!/bin/bash
# scripts/start.sh - UPDATED with correct path handling

set -e

echo "🚀 Starting SORO Mental Health Platform..."
echo "=========================================="

# Log environment info
echo "Environment: ${NODE_ENV:-development}"
echo "Port: ${PORT:-5001}"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"

# Function to find main.js in various locations
find_main_js() {
    # Check common locations
    if [ -f "dist/main.js" ]; then
        echo "dist/main.js"
    elif [ -f "dist/src/main.js" ]; then
        echo "dist/src/main.js"
    elif [ -f "dist/server/main.js" ]; then
        echo "dist/server/main.js"
    else
        # Try to find it
        find dist -name "main.js" -type f 2>/dev/null | head -1
    fi
}

# Check if we have a main.js file
MAIN_JS=$(find_main_js)

if [ -z "$MAIN_JS" ] || [ ! -f "$MAIN_JS" ]; then
    echo "📦 Building application..."
    npm run build || {
        echo "❌ Build failed!"
        exit 1
    }
    
    # Check again after build
    MAIN_JS=$(find_main_js)
    
    if [ -z "$MAIN_JS" ] || [ ! -f "$MAIN_JS" ]; then
        echo "❌ Could not find main.js after build!"
        echo "📁 Checking dist directory structure:"
        find dist -type f -name "*.js" | head -20
        exit 1
    fi
    echo "✅ Build complete"
fi

echo "📄 Main JavaScript file: $MAIN_JS"

# If main.js is in dist/src/, move it to dist/ for consistency
if [[ "$MAIN_JS" == "dist/src/main.js" ]]; then
    echo "🔄 Fixing path: moving dist/src/main.js to dist/main.js"
    mv dist/src/main.js dist/main.js 2>/dev/null
    # Move other files too if they exist
    if [ -d "dist/src" ]; then
        mv dist/src/* dist/ 2>/dev/null
        rmdir dist/src 2>/dev/null || true
    fi
    MAIN_JS="dist/main.js"
fi

# Function to parse DATABASE_URL correctly
parse_database_url() {
    local url="$1"
    
    if [ -z "$url" ]; then
        echo "No DATABASE_URL provided"
        return 1
    fi
    
    # Remove protocol (postgresql://)
    local no_proto="${url#*://}"
    
    # Remove credentials if present
    local no_creds="$no_proto"
    if [[ "$no_proto" == *"@"* ]]; then
        no_creds="${no_proto#*@}"
    fi
    
    # Extract host (everything before : or /)
    DB_HOST="${no_creds%%[:/]*}"
    
    # Check if there's a port
    if [[ "$no_creds" =~ :([0-9]+)/ ]]; then
        DB_PORT="${BASH_REMATCH[1]}"
    else
        DB_PORT="5432"  # PostgreSQL default
    fi
    
    echo "Parsed database: $DB_HOST:$DB_PORT"
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ WARNING: DATABASE_URL environment variable is not set!"
    echo "⚠️ Starting in local development mode without database."
    DB_AVAILABLE=false
else
    echo "✅ DATABASE_URL is set"
    
    # Parse the URL
    parse_database_url "$DATABASE_URL"
    
    if [ -z "$DB_HOST" ]; then
        echo "❌ Failed to parse DATABASE_URL"
        DB_AVAILABLE=false
    else
        DB_AVAILABLE=true
        echo "📊 Database Info:"
        echo "  Host: $DB_HOST"
        echo "  Port: $DB_PORT"
    fi
fi

# Generate Prisma client (always do this)
echo "🔄 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"

# Run migrations if database is available
if [ "$DB_AVAILABLE" = true ]; then
    echo "🔄 Attempting database migrations..."
    
    # Try migrations with a simple approach
    echo "Running database migrations..."
    if npx prisma migrate deploy; then
        echo "✅ Database migrations completed successfully"
    else
        echo "⚠️ Migration failed or not needed"
        echo "⚠️ Starting application without applying migrations"
    fi
else
    echo "⏭️ Skipping database migrations (no DATABASE_URL)"
fi

# Start the application
echo "🚀 Starting NestJS application..."
echo "========================================"
echo "Launching: node $MAIN_JS"
echo "========================================"

exec node "$MAIN_JS"