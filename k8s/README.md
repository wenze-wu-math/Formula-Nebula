# Formula Nebula Kubernetes Manifests

Production-ready Kubernetes configuration for Formula Nebula, optimized for scaling to 100K+ concurrent users.

## 📁 File Structure

```
k8s/
├── namespace.yaml              # Namespace definition
├── configmap.yaml              # Application configuration
├── secret.yaml                 # Secrets (passwords, keys)
├── storage.yaml                # Storage classes and PVCs
├── statefulset-db.yaml         # PostgreSQL and Redis StatefulSets
├── deployment.yaml             # Web and Collaboration deployments
├── service.yaml                # Service definitions
├── ingress.yaml                # Ingress configuration with TLS
├── autoscale.yaml              # HPA, VPA, and PDB configs
├── network-policy.yaml         # Network security policies
├── monitoring.yaml             # Prometheus and Grafana config
├── backup-cronjob.yaml         # Backup and maintenance jobs
├── kustomization.yaml          # Kustomize configuration
├── DEPLOYMENT_GUIDE.md         # Comprehensive deployment guide
├── QUICK_START.md              # Quick start guide
└── README.md                   # This file
```

## 🚀 Quick Start

For rapid deployment, see [QUICK_START.md](./QUICK_START.md).

For comprehensive documentation, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## 📊 Architecture Overview

### Components

1. **Web Frontend** (10-100 pods)
   - Serves static assets
   - NGINX-based
   - Auto-scales based on CPU/memory/RPS

2. **Collaboration Server** (20-200 pods)
   - WebSocket server for real-time collaboration
   - Node.js-based
   - Auto-scales based on connections and active rooms

3. **PostgreSQL** (3 pods)
   - Primary database
   - StatefulSet with persistent storage
   - Configured for high performance

4. **Redis** (3 pods)
   - Caching and session management
   - StatefulSet with persistence
   - LRU eviction policy

### Scaling Capabilities

| Component | Min | Max | Users/Pod |
|-----------|-----|-----|-----------|
| Web       | 10  | 100 | 1K-10K    |
| Collab    | 20  | 200 | 500-5K    |
| Total     | -   | -   | 100K+     |

## 🔧 Configuration

### Environment Variables

Key configuration in `configmap.yaml`:
- `NODE_ENV`: Environment (production/staging)
- `COLLAB_PORT`: WebSocket server port
- `MAX_CONNECTIONS`: Max WebSocket connections per pod
- `WORKER_THREADS`: Worker thread count
- Resource limits and requests

### Secrets

Update `secret.yaml` with base64-encoded values:
```bash
echo -n "your-secret" | base64
```

Required secrets:
- `DB_PASSWORD`: PostgreSQL password
- `REDIS_PASSWORD`: Redis password
- `JWT_SECRET`: JWT signing key
- `API_KEY`: API authentication key

## 📦 Resource Requirements

### Per Pod

**Web Frontend:**
- Request: 500m CPU, 512Mi memory
- Limit: 2 CPU, 2Gi memory

**Collaboration Server:**
- Request: 1 CPU, 1Gi memory
- Limit: 4 CPU, 4Gi memory

**PostgreSQL:**
- Request: 2 CPU, 4Gi memory
- Limit: 4 CPU, 8Gi memory

**Redis:**
- Request: 500m CPU, 1Gi memory
- Limit: 2 CPU, 3Gi memory

### Cluster Size

For 100K concurrent users:
- **Nodes**: 10-100 (auto-scaling)
- **Node Size**: 16 vCPU, 32GB RAM minimum
- **Storage**: 100Gi+ SSD per database
- **Network**: 10Gbps+ recommended

## 🔐 Security Features

- TLS/SSL termination at ingress
- Network policies for pod isolation
- Non-root containers
- Secret encryption at rest
- RBAC (not included, configure separately)
- Pod Security Standards (configure separately)

## 📈 Auto-scaling

### Horizontal Pod Autoscaler (HPA)

**Web Frontend:**
- Metrics: CPU (70%), Memory (75%), RPS (1000)
- Scale up: Fast (100% every 30s, max 10 pods)
- Scale down: Slow (50% every 60s, max 5 pods)

**Collaboration Server:**
- Metrics: CPU (65%), Memory (70%), Connections (500), Rooms (250)
- Scale up: Aggressive (100% every 30s, max 20 pods)
- Scale down: Conservative (25% every 120s, max 5 pods)

### Vertical Pod Autoscaler (VPA)

Automatically adjusts resource requests/limits based on actual usage.

### Cluster Autoscaler

Node pool scales from 10 to 100 nodes based on pod demands.

## 🎯 Load Balancing

- **NGINX Ingress**: Layer 7 load balancing with TLS
- **Service ClusterIP**: Internal load balancing
- **Session Affinity**: ClientIP-based for WebSocket (3-hour timeout)
- **Health Checks**: Liveness and readiness probes

## 💾 Storage

### Storage Classes

- `fast-ssd`: High-performance (16K IOPS, 1000MB/s)
- `standard-ssd`: Standard (3K IOPS, 125MB/s)
- `backup-storage`: Cold storage for backups

### Persistence

- PostgreSQL: 100Gi per pod
- Redis: 20Gi per pod
- Backups: 500Gi shared volume

## 🔄 Backup & Recovery

Automated backups via CronJobs:
- **PostgreSQL**: Daily at 2 AM, 30-day retention
- **Redis**: Snapshots every 6 hours
- **Logs**: Cleanup every 7 days

## 📊 Monitoring

### Prometheus Metrics

- Application: RPS, latency, errors, connections
- Infrastructure: CPU, memory, network, disk
- Database: Query performance, connections, cache hits

### Grafana Dashboards

Pre-configured dashboard for system overview:
- Active users and connections
- Request rate and response times
- Error rates and alerts
- Resource utilization

## 🚦 Health Checks

All services include:
- **Liveness Probe**: Restart if unhealthy
- **Readiness Probe**: Remove from service if not ready
- **Startup Probe**: Allow time for initialization

## 🌐 Networking

### Ingress Configuration

- HTTP → HTTPS redirect
- TLS 1.2+ with strong ciphers
- WebSocket support with upgrade headers
- Rate limiting (100 req/s per IP)
- Compression (gzip level 6)
- CORS enabled

### Network Policies

- Web pods: Can access PostgreSQL and Redis
- Collab pods: Can access Redis and PostgreSQL
- Database pods: Only accept connections from app pods
- Egress: DNS and HTTPS allowed

## 🔧 Maintenance

### Rolling Updates

```bash
kubectl set image deployment/formula-nebula-web web=registry/image:v2 -n formula-nebula
kubectl rollout status deployment/formula-nebula-web -n formula-nebula
```

### Rollback

```bash
kubectl rollout undo deployment/formula-nebula-web -n formula-nebula
```

### Database Maintenance

```bash
# Connect to PostgreSQL
kubectl exec -it postgres-0 -n formula-nebula -- psql -U formula_user -d formula_nebula

# Run maintenance
VACUUM ANALYZE;
REINDEX DATABASE formula_nebula;
```

## 📝 Deployment Checklist

Before deploying:
- [ ] Build and push Docker images
- [ ] Update image references in deployment.yaml
- [ ] Generate and update secrets
- [ ] Configure domain names in ingress.yaml
- [ ] Update ConfigMap with environment-specific values
- [ ] Ensure storage classes exist in cluster
- [ ] Install required add-ons (ingress, cert-manager, metrics)

After deploying:
- [ ] Verify all pods are running
- [ ] Check ingress has external IP
- [ ] Configure DNS records
- [ ] Test application endpoints
- [ ] Verify SSL certificates
- [ ] Monitor autoscaling behavior
- [ ] Set up alerts
- [ ] Configure backups

## 🐛 Troubleshooting

### Common Issues

1. **ImagePullBackOff**: Check registry credentials
2. **CrashLoopBackOff**: Check logs with `kubectl logs`
3. **Pending Pods**: Check node resources and PVCs
4. **High Latency**: Check resource limits and HPA
5. **Database Errors**: Verify connection strings and secrets

### Debug Commands

```bash
# Get all resources
kubectl get all -n formula-nebula

# Describe pod issues
kubectl describe pod <pod-name> -n formula-nebula

# View logs
kubectl logs -f <pod-name> -n formula-nebula

# Events
kubectl get events -n formula-nebula --sort-by='.lastTimestamp'

# Resource usage
kubectl top pods -n formula-nebula
kubectl top nodes
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [NGINX Ingress](https://kubernetes.github.io/ingress-nginx/)
- [Cert-Manager](https://cert-manager.io/)
- [Prometheus](https://prometheus.io/)
- [PostgreSQL Tuning](https://pgtune.leopard.in.ua/)

## 🤝 Contributing

To improve these manifests:
1. Test changes in a staging environment
2. Document the changes
3. Update version numbers
4. Submit a pull request

## 📄 License

Same as the main Formula Nebula project.

## 💬 Support

- Issues: GitHub Issues
- Documentation: See DEPLOYMENT_GUIDE.md
- Email: support@formula-nebula.com

---

**Version**: 1.0.0  
**Last Updated**: 2026-11-02  
**Tested With**: Kubernetes 1.28+
