# Formula Nebula - Docker Deployment Guide

## Overview

This project includes a multi-stage Docker setup with three images:
1. **Builder**: Compiles and optimizes assets
2. **Runtime**: Minimal production image with prebuilt assets
3. **Development**: Full dev environment with hot reload

## Quick Start

### Production Deployment

```bash
# Start all services (app + redis + postgres)
docker-compose up -d

# Access the application
open http://localhost:5176
```

### Development Environment

```bash
# Start dev environment with hot reload
docker-compose --profile dev up app-dev

# Access dev server
open http://localhost:5175
```

## Architecture

### Multi-Stage Build

```
┌─────────────────────────────────────────────┐
│  Stage 1: Builder (node:24-alpine)          │
│  - Install all dependencies                 │
│  - Build with Vite                          │
│  - Minify and optimize                      │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Stage 2: Runtime (node:24-alpine)          │
│  - Copy built assets from builder           │
│  - Install production dependencies only     │
│  - Run as non-root user                     │
│  - Health checks enabled                    │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Stage 3: Development (node:24-alpine)      │
│  - All dev dependencies                     │
│  - Volume mounts for hot reload             │
│  - Full tooling (git, bash, curl)           │
└─────────────────────────────────────────────┘
```

### Services

- **app**: Production application (port 5176 + 8080)
- **app-dev**: Development with hot reload (port 5175 + 8081)
- **redis**: Cache service (port 6379)
- **postgres**: Database service (port 5432)

### Network

All services communicate through `formula-nebula-network` bridge network.

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Key variables:
- `APP_PORT`: Production app port (default: 5176)
- `DEV_PORT`: Development app port (default: 5175)
- `COLLAB_PORT`: Collaboration server port (default: 8080)
- `POSTGRES_PASSWORD`: Database password (change in production!)
- `REDIS_PORT`: Redis port (default: 6379)

### Port Mapping

| Service | Internal Port | External Port | Description |
|---------|--------------|---------------|-------------|
| app     | 5176         | 5176          | Production app |
| app     | 8080         | 8080          | Collaboration server |
| app-dev | 5175         | 5175          | Dev server |
| app-dev | 8080         | 8081          | Collab server (dev) |
| redis   | 6379         | 6379          | Cache |
| postgres| 5432         | 5432          | Database |

## Commands

### Build Images

```bash
# Build all stages
./docker-build.sh

# Or manually
docker build --target runtime -t formula-nebula:runtime .
docker build --target development -t formula-nebula:development .
```

### Run Services

```bash
# Start production
docker-compose up -d app redis postgres

# Start development
docker-compose --profile dev up -d app-dev redis postgres

# Start all (includes both prod and dev)
docker-compose --profile dev up -d

# View logs
docker-compose logs -f app

# Stop all
docker-compose down
```

### Manage Services

```bash
# Restart a service
docker-compose restart app

# Rebuild and restart
docker-compose up -d --build app

# Execute commands in container
docker-compose exec app sh

# View service status
docker-compose ps
```

### Database Operations

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U nebula -d formula_nebula

# Backup database
docker-compose exec postgres pg_dump -U nebula formula_nebula > backup.sql

# Restore database
docker-compose exec -T postgres psql -U nebula -d formula_nebula < backup.sql

# Access Redis CLI
docker-compose exec redis redis-cli
```

### Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (⚠️ deletes data!)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Full cleanup
docker system prune -a --volumes
```

## Health Checks

All services include health checks:

- **App**: HTTP check on main port every 30s
- **Redis**: Redis CLI ping every 10s
- **Postgres**: pg_isready check every 10s

View health status:
```bash
docker-compose ps
```

## Volume Mounts

### Development Volumes (Hot Reload)

The dev container mounts source directories for live updates:
- `./src` → `/app/src`
- `./public` → `/app/public`
- `./index.html` → `/app/index.html`
- `./vite.config.js` → `/app/vite.config.js`

Changes are immediately reflected without rebuilding.

### Persistent Volumes

- `node_modules_dev`: Dev dependencies (prevents overwriting)
- `redis-data`: Redis persistence
- `postgres-data`: PostgreSQL data

## Security

### Non-Root User

Both runtime and dev images run as user `nebula` (UID 1001).

### Secrets

Never commit `.env` files. Use Docker secrets in production:

```yaml
secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt
```

### Network Isolation

Services communicate through internal bridge network. Only exposed ports are accessible externally.

## Performance

### Image Sizes

Typical sizes after build:
- **Builder**: ~800-1000 MB (includes all build tools)
- **Runtime**: ~400-500 MB (production only)
- **Development**: ~600-800 MB (all dev tools)

### Optimization Tips

1. **Multi-stage build** reduces runtime image by ~50%
2. **Alpine Linux** base minimizes size
3. **npm ci** uses frozen lockfile for faster installs
4. **Production-only deps** in runtime stage
5. **Layer caching** speeds up rebuilds

### Build Performance

```bash
# Parallel build
docker-compose build --parallel

# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build .

# Cache from previous build
docker build --cache-from formula-nebula:runtime .
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check health status
docker-compose ps

# Enter container
docker-compose exec app sh
```

### Port Already in Use

```bash
# Change port in .env
echo "APP_PORT=5177" >> .env

# Or stop conflicting service
docker-compose down
```

### Volume Issues

```bash
# Remove and recreate volumes
docker-compose down -v
docker-compose up -d
```

### Build Fails

```bash
# Clean build cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache

# Check .dockerignore
cat .dockerignore
```

## Production Deployment

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml formula-nebula

# Scale services
docker service scale formula-nebula_app=3
```

### Kubernetes

Generate Kubernetes manifests:
```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.31.2/kompose-linux-amd64 -o kompose

# Convert docker-compose to k8s
./kompose convert -f docker-compose.yml
```

### Cloud Deployment

- **AWS ECS**: Use docker-compose for ECS CLI
- **Google Cloud Run**: Deploy runtime image directly
- **Azure Container Apps**: Use Bicep templates
- **DigitalOcean App Platform**: Connect to Git repo

## Monitoring

### Resource Usage

```bash
# Container stats
docker stats

# Service-specific stats
docker stats formula-nebula-app

# Disk usage
docker system df
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# Since timestamp
docker-compose logs --since 2024-01-01T00:00:00 app
```

## Advanced Configuration

### Custom Dockerfile

Create `Dockerfile.custom` for project-specific needs:
```dockerfile
FROM formula-nebula:runtime
# Add custom layers
```

### Override Compose

Create `docker-compose.override.yml` for local customization:
```yaml
version: '3.8'
services:
  app:
    ports:
      - "8000:5176"
```

## License

This Docker configuration is part of Formula Nebula project.
