# ==========================================
# Formula Nebula - Multi-Stage Dockerfile
# ==========================================
# Stage 1: Build - Compile assets, minify code
# Stage 2: Runtime - Minimal Node image + prebuilt assets
# Stage 3: Dev - With all tools and watchers
# ==========================================

# ==========================================
# Build Stage - Compile and optimize assets
# ==========================================
FROM node:24-alpine AS builder

LABEL stage=builder
LABEL description="Build stage for Formula Nebula"

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install dependencies (use install instead of ci due to lock mismatch)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify build output
RUN test -d dist && \
    echo "✓ Build successful" && \
    du -sh dist

# ==========================================
# Runtime Stage - Production image
# ==========================================
FROM node:24-alpine AS runtime

LABEL maintainer="Formula Nebula Team"
LABEL description="Formula Nebula - Algebraic Geometry Knowledge Graph Visualization"
LABEL version="0.1.0"

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache tini

# Create non-root user
RUN addgroup -g 1001 -S nebula && \
    adduser -u 1001 -S nebula -G nebula

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production && \
    npm cache clean --force

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/index.html ./
COPY --from=builder /app/vite.config.js ./

# Copy collaboration server
COPY src/collaboration ./src/collaboration

# Change ownership
RUN chown -R nebula:nebula /app

# Switch to non-root user
USER nebula

# Expose ports
EXPOSE 5176 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5176/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })" || exit 1

# Use tini as init process
ENTRYPOINT ["/sbin/tini", "--"]

# Default command: serve preview + collaboration server
CMD ["sh", "-c", "npm run preview & npm run collab:server"]

# ==========================================
# Development Stage - With all tools
# ==========================================
FROM node:24-alpine AS development

LABEL stage=development
LABEL description="Development environment for Formula Nebula"

WORKDIR /app

# Install dev dependencies
RUN apk add --no-cache \
    git \
    bash \
    curl \
    tini \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy all source files
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nebula && \
    adduser -u 1001 -S nebula -G nebula && \
    chown -R nebula:nebula /app

# Switch to non-root user
USER nebula

# Expose ports for dev server and collaboration
EXPOSE 5175 8080

# Health check for dev server
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5175/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })" || exit 1

# Use tini as init process
ENTRYPOINT ["/sbin/tini", "--"]

# Default command: dev server with hot reload
CMD ["sh", "-c", "npm run dev & npm run collab:server"]
