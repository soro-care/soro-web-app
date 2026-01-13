#!/bin/bash
# scripts/test-parse-fixed.sh

DATABASE_URL="postgresql://user:pass@ep-soft-dust-ahp3of1q-pooler.c-3.us-east-1.aws.neon.tech/dbname?sslmode=require"

echo "Original URL: $DATABASE_URL"
echo ""

# FIXED Method 1: Better sed parsing
echo "Fixed Method 1 (sed):"
# Extract everything after @ and before / or :port/
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:/]*\).*/\1/p')
# Check if there's a port after the host
if [[ "$DATABASE_URL" =~ @[^:/]+:([0-9]+) ]]; then
    DB_PORT="${BASH_REMATCH[1]}"
else
    DB_PORT="5432"
fi
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo ""

# FIXED Method 2: Using parameter expansion
echo "Fixed Method 2 (bash parameter expansion):"
# Remove protocol
url="${DATABASE_URL#postgresql://}"
# Extract credentials and host
if [[ "$url" =~ ([^:@]+:[^:@]+@)?([^:/]+)(:([0-9]+))?/ ]]; then
    DB_HOST2="${BASH_REMATCH[2]}"
    DB_PORT2="${BASH_REMATCH[4]:-5432}"
fi
echo "Host: $DB_HOST2"
echo "Port: $DB_PORT2"
echo ""

# FIXED Method 3: Using cut and rev
echo "Fixed Method 3 (cut & rev):"
# Remove protocol
no_proto="${DATABASE_URL#postgresql://}"
# Remove credentials
no_creds="${no_proto#*@}"
# Get host (everything before : or /)
DB_HOST3="${no_creds%%[:/]*}"
# Check if there's a port
if [[ "$no_creds" =~ :([0-9]+)/ ]]; then
    DB_PORT3="${BASH_REMATCH[1]}"
else
    DB_PORT3="5432"
fi
echo "Host: $DB_HOST3"
echo "Port: $DB_PORT3"
echo ""

# Method 4: Node.js parsing (most reliable)
echo "Method 4 (Node.js):"
node << 'EOF'
const url = process.env.TEST_URL || "postgresql://user:pass@ep-soft-dust-ahp3of1q-pooler.c-3.us-east-1.aws.neon.tech/dbname?sslmode=require";
try {
    const parsed = new URL(url);
    console.log("Host:", parsed.hostname);
    console.log("Port:", parsed.port || "5432 (default)");
    console.log("Actual port number:", parsed.port || "5432");
} catch (e) {
    console.error("Parse error:", e.message);
}
EOF