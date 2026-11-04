# Formula Nebula - Docker Quick Start

## TL;DR

```bash
# Production (recommended)
docker-compose up -d
open http://localhost:5176

# Development (with hot reload)
docker-compose --profile dev up app-dev
open http://localhost:5175

# Stop all
docker-compose down
```

## Image Sizes

| Image | Size | Use Case |
|-------|------|----------|
| `formula-nebula:runtime` | 508 MB | Production deployment |
| `formula-nebula:development` | 3.71 GB | Local development |
| `formula-nebula:builder` | 2.22 GB | Build stage only |

## Port Map

| Service | Port | Access |
|---------|------|--------|
| Production App | 5176 | http://localhost:5176 |
| Collab Server | 8080 | ws://localhost:8080 |
| Dev App | 5175 | http://localhost:5175 |
| Collab Dev | 8081 | ws://localhost:8081 |
| Redis | 6379 | Internal |
| PostgreSQL | 5432 | Internal |

## Common Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d                    # Production
docker-compose --profile dev up -d      # Development

# View logs
docker-compose logs -f app              # Follow app logs
docker-compose logs --tail=50 app       # Last 50 lines

# Service management
docker-compose restart app              # Restart app
docker-compose stop                     # Stop all
docker-compose down                     # Stop + remove containers
docker-compose down -v                  # Stop + remove volumes (⚠️ deletes data)

# Database access
docker-compose exec postgres psql -U nebula -d formula_nebula
docker-compose exec redis redis-cli

# Shell access
docker-compose exec app sh              # Enter app container
docker-compose exec -u root app sh      # Enter as root

# Health check
docker-compose ps                       # View service status
docker stats                            # Resource usage
```

## Configuration

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env (optional)**
   ```env
   APP_PORT=5176
   POSTGRES_PASSWORD=your_secure_password
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

## Development Workflow

```bash
# Start dev environment
docker-compose --profile dev up -d app-dev

# Edit files locally (auto-reloads)
# - src/
# - public/
# - index.html
# - vite.config.js

# View logs
docker-compose logs -f app-dev

# Stop when done
docker-compose down
```

## Troubleshooting

### Port already in use
```bash
# Change port in .env
echo "APP_PORT=5177" >> .env
docker-compose up -d
```

### Container won't start
```bash
# Check logs
docker-compose logs app

# Restart
docker-compose restart app
```

### Database issues
```bash
# Reset database (⚠️ deletes data)
docker-compose down -v
docker-compose up -d
```

### Build fails
```bash
# Clean rebuild
docker-compose build --no-cache
docker-compose up -d
```

## Health Checks

All services include automatic health monitoring:
- **App**: HTTP check every 30s
- **Redis**: Ping every 10s  
- **PostgreSQL**: Readiness check every 10s

View status: `docker-compose ps`

## Production Notes

⚠️ **Before production deployment:**

1. Change PostgreSQL password in `.env`
2. Review security settings
3. Set up HTTPS/reverse proxy
4. Configure backups
5. Enable monitoring

## More Info

- Full documentation: `README.Docker.md`
- Build summary: `DOCKER_BUILD_SUMMARY.md`
- Build script: `./docker-build.sh`
