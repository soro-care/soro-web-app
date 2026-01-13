# =========================
# Builder stage
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies (including openssl for Prisma)
RUN apk add --no-cache bash git python3 make g++ openssl

# Copy package files & Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev deps for building)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build NestJS app
RUN npm run build

# Move files from dist/src to dist/ if needed
RUN if [ -d "dist/src" ]; then \
      echo "Moving build output from dist/src to dist/"; \
      mv dist/src/* dist/ 2>/dev/null; \
      rmdir dist/src 2>/dev/null || true; \
    fi

# =========================
# Production stage
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init bash openssl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copy package files
COPY --chown=nestjs:nodejs package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application - check multiple possible locations
COPY --chown=nestjs:nodejs --from=builder /app/dist ./dist

# Fix path: If main.js is in dist/src/, move it up
RUN if [ -f "dist/src/main.js" ]; then \
      echo "Fixing path: moving dist/src/* to dist/"; \
      mv dist/src/* dist/; \
      rmdir dist/src; \
    fi

# Verify main.js exists
RUN if [ ! -f "dist/main.js" ]; then \
      echo "ERROR: dist/main.js not found!"; \
      echo "Contents of dist/:"; ls -la dist/; \
      exit 1; \
    fi

# Copy Prisma schema and generated client
COPY --chown=nestjs:nodejs --from=builder /app/prisma ./prisma
COPY --chown=nestjs:nodejs --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=nestjs:nodejs --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma Engine binaries (IMPORTANT!)
COPY --chown=nestjs:nodejs --from=builder /app/node_modules/@prisma/engines ./node_modules/@prisma/engines
COPY --chown=nestjs:nodejs --from=builder /app/node_modules/prisma ./node_modules/prisma

# Switch to non-root
USER nestjs

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.request({host: 'localhost', port: 5001, path: '/api/health', timeout: 2000}, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => { process.exit(1); }); req.end();"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start app
CMD ["node", "dist/main.js"]