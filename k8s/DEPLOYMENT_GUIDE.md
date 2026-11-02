# Formula Nebula Kubernetes Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying Formula Nebula to Kubernetes, optimized for scaling to 100K+ concurrent users.

## Architecture

- **Frontend (Web)**: 10-100 pods, auto-scaling based on CPU/memory/RPS
- **Collaboration Server (WebSocket)**: 20-200 pods, auto-scaling based on connections
- **PostgreSQL**: 3-node StatefulSet (1 primary + 2 replicas)
- **Redis**: 3-node StatefulSet for caching and session management
- **Load Balancing**: NGINX Ingress with SSL/TLS termination
- **Autoscaling**: Horizontal Pod Autoscaler (HPA) + Vertical Pod Autoscaler (VPA)

## Prerequisites

### 1. Kubernetes Cluster

Minimum requirements for 100K+ concurrent users:
- Kubernetes version: 1.28+
- Node pool: 10-100 nodes (auto-scaling enabled)
- Node size: 16 vCPU, 32 GB RAM minimum per node
- Total capacity: 160-1600 vCPUs, 320-3200 GB RAM

Recommended cloud providers:
- AWS EKS
- Google GKE
- Azure AKS
- DigitalOcean Kubernetes

### 2. Required Tools

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Install helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify installations
kubectl version --client
helm version
```

### 3. Required Kubernetes Add-ons

Install these before deploying:

```bash
# NGINX Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.replicaCount=3 \
  --set controller.nodeSelector."kubernetes\.io/os"=linux \
  --set defaultBackend.nodeSelector."kubernetes\.io/os"=linux

# Cert-Manager (for SSL/TLS)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Metrics Server (required for HPA)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Vertical Pod Autoscaler (optional but recommended)
git clone https://github.com/kubernetes/autoscaler.git
cd autoscaler/vertical-pod-autoscaler
./hack/vpa-up.sh
```

## Deployment Steps

### Step 1: Build and Push Docker Images

Create Dockerfiles for your application:

**Dockerfile.web** (Frontend):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
```

**Dockerfile.collab** (Collaboration Server):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
USER node
CMD ["node", "src/collaboration/server/index.js"]
```

Build and push:
```bash
# Replace with your registry
export REGISTRY="your-registry.com"
export VERSION="v1.0.0"

# Build images
docker build -f Dockerfile.web -t $REGISTRY/formula-nebula-web:$VERSION .
docker build -f Dockerfile.collab -t $REGISTRY/formula-nebula-collab:$VERSION .

# Push to registry
docker push $REGISTRY/formula-nebula-web:$VERSION
docker push $REGISTRY/formula-nebula-collab:$VERSION
```

### Step 2: Configure Secrets

Update the secrets in `k8s/secret.yaml` with your actual values:

```bash
# Generate secure passwords
export DB_PASSWORD=$(openssl rand -base64 32)
export REDIS_PASSWORD=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 64)

# Encode to base64
echo -n "$DB_PASSWORD" | base64
echo -n "$REDIS_PASSWORD" | base64
echo -n "$JWT_SECRET" | base64

# Update secret.yaml with the encoded values
```

### Step 3: Update Configuration

Edit `k8s/configmap.yaml` to match your environment:
- Update `VITE_API_URL`, `VITE_WS_URL`, `VITE_CDN_URL` with your actual domains
- Adjust resource limits based on your workload

Edit `k8s/ingress.yaml`:
- Replace `formula-nebula.com` with your actual domain
- Update TLS certificate settings

Edit `k8s/deployment.yaml`:
- Replace image references with your registry URLs

### Step 4: Create Namespace and Apply Configurations

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMaps and Secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Apply Storage Classes and PVCs
kubectl apply -f k8s/storage.yaml
```

### Step 5: Deploy StatefulSets (Databases)

```bash
# Deploy PostgreSQL and Redis
kubectl apply -f k8s/statefulset-db.yaml

# Wait for StatefulSets to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n formula-nebula --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n formula-nebula --timeout=300s

# Verify
kubectl get statefulsets -n formula-nebula
kubectl get pods -n formula-nebula
```

### Step 6: Initialize Database

```bash
# Connect to PostgreSQL pod
kubectl exec -it postgres-0 -n formula-nebula -- psql -U formula_user -d formula_nebula

# Run your database migrations/schema
# Example:
# \i /path/to/schema.sql
```

### Step 7: Deploy Application Services

```bash
# Deploy Services
kubectl apply -f k8s/service.yaml

# Deploy Deployments
kubectl apply -f k8s/deployment.yaml

# Wait for deployments
kubectl rollout status deployment/formula-nebula-web -n formula-nebula
kubectl rollout status deployment/formula-nebula-collab -n formula-nebula
```

### Step 8: Configure Ingress and SSL

```bash
# Create ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Deploy Ingress
kubectl apply -f k8s/ingress.yaml

# Wait for SSL certificates
kubectl get certificate -n formula-nebula
```

### Step 9: Enable Autoscaling

```bash
# Deploy HPA and VPA
kubectl apply -f k8s/autoscale.yaml

# Verify autoscalers
kubectl get hpa -n formula-nebula
kubectl get vpa -n formula-nebula
```

### Step 10: Configure Network Policies (Optional)

```bash
# Apply network policies for security
kubectl apply -f k8s/network-policy.yaml
```

### Step 11: Set Up Monitoring

```bash
# Install Prometheus and Grafana (using helm)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

# Apply monitoring configuration
kubectl apply -f k8s/monitoring.yaml

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Default credentials: admin / prom-operator
```

### Step 12: Set Up Backup Jobs

```bash
# Deploy backup CronJobs
kubectl apply -f k8s/backup-cronjob.yaml

# Verify CronJobs
kubectl get cronjobs -n formula-nebula
```

## Verification

### Check All Resources

```bash
# Get all resources
kubectl get all -n formula-nebula

# Check pod status
kubectl get pods -n formula-nebula -o wide

# Check services
kubectl get services -n formula-nebula

# Check ingress
kubectl get ingress -n formula-nebula
```

### Test Application

```bash
# Get ingress IP/hostname
kubectl get ingress -n formula-nebula

# Test web endpoint
curl https://formula-nebula.com

# Test WebSocket endpoint (using wscat)
npm install -g wscat
wscat -c wss://ws.formula-nebula.com
```

### Monitor Autoscaling

```bash
# Watch HPA
kubectl get hpa -n formula-nebula -w

# Watch pods scaling
kubectl get pods -n formula-nebula -w

# Check metrics
kubectl top nodes
kubectl top pods -n formula-nebula
```

## Performance Tuning

### 1. Node Configuration

For optimal performance with 100K+ users:

```yaml
# Recommended node taints and labels
kubectl label nodes <node-name> workload=frontend
kubectl label nodes <node-name> workload=websocket
kubectl label nodes <node-name> workload=database
```

### 2. Cluster Autoscaler Configuration

```bash
# Configure cluster autoscaler
kubectl -n kube-system edit deployment cluster-autoscaler

# Add these flags:
--scale-down-delay-after-add=10m
--scale-down-unneeded-time=10m
--skip-nodes-with-system-pods=false
--balance-similar-node-groups=true
```

### 3. NGINX Ingress Tuning

```yaml
# Add to ingress-nginx ConfigMap
data:
  worker-processes: "auto"
  worker-connections: "65536"
  keepalive-requests: "10000"
  upstream-keepalive-connections: "1024"
  max-worker-connections: "65536"
```

### 4. PostgreSQL Performance

```bash
# Connect to PostgreSQL
kubectl exec -it postgres-0 -n formula-nebula -- psql -U formula_user -d formula_nebula

# Run performance optimizations
CREATE INDEX CONCURRENTLY idx_users_active ON users(last_active) WHERE active = true;
VACUUM ANALYZE;
```

### 5. Redis Optimization

```bash
# Connect to Redis
kubectl exec -it redis-0 -n formula-nebula -- redis-cli -a <password>

# Monitor performance
INFO stats
SLOWLOG GET 10
```

## Scaling Guidelines

### Capacity Planning

For 100K concurrent users:

| Component | Min Pods | Max Pods | Users per Pod |
|-----------|----------|----------|---------------|
| Web       | 10       | 100      | 1,000-10,000  |
| Collab    | 20       | 200      | 500-5,000     |
| PostgreSQL| 3        | 3        | N/A           |
| Redis     | 3        | 3        | N/A           |

### Load Testing

Use tools like k6 or Artillery for load testing:

```javascript
// k6 load test script
import http from 'k6/http';
import { check, sleep } from 'k6';
import ws from 'k6/ws';

export let options = {
  stages: [
    { duration: '5m', target: 10000 },
    { duration: '10m', target: 50000 },
    { duration: '10m', target: 100000 },
    { duration: '5m', target: 0 },
  ],
};

export default function () {
  // HTTP test
  let response = http.get('https://formula-nebula.com');
  check(response, { 'status is 200': (r) => r.status === 200 });
  
  // WebSocket test
  const url = 'wss://ws.formula-nebula.com';
  const res = ws.connect(url, function (socket) {
    socket.on('open', () => {
      socket.send(JSON.stringify({ type: 'ping' }));
    });
    socket.on('message', (data) => {
      console.log('Message received:', data);
    });
    socket.on('close', () => {
      console.log('Disconnected');
    });
  });
  
  sleep(1);
}
```

Run the test:
```bash
k6 run --vus 100000 --duration 30m loadtest.js
```

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Application Metrics**:
   - Active WebSocket connections
   - HTTP request rate and latency
   - Error rates
   - Active rooms/sessions

2. **Infrastructure Metrics**:
   - Pod CPU and memory usage
   - Node CPU and memory usage
   - Network I/O
   - Disk I/O

3. **Database Metrics**:
   - Query performance
   - Connection pool usage
   - Replication lag
   - Cache hit ratio

### Prometheus Queries

```promql
# Active users
sum(websocket_connections)

# Request rate
sum(rate(http_requests_total[5m]))

# Error rate
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Pod CPU usage
sum(rate(container_cpu_usage_seconds_total{namespace="formula-nebula"}[5m])) by (pod)

# Pod memory usage
sum(container_memory_working_set_bytes{namespace="formula-nebula"}) by (pod)
```

### Alert Rules

Create `k8s/alerts.yaml`:
```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: formula-nebula-alerts
  namespace: formula-nebula
spec:
  groups:
  - name: formula-nebula
    interval: 30s
    rules:
    - alert: HighErrorRate
      expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "High error rate detected"
        description: "Error rate is {{ $value | humanizePercentage }}"
    
    - alert: HighLatency
      expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High latency detected"
        description: "P95 latency is {{ $value }}s"
    
    - alert: PodCPUHigh
      expr: sum(rate(container_cpu_usage_seconds_total{namespace="formula-nebula"}[5m])) by (pod) > 0.8
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: "Pod CPU usage high"
        description: "Pod {{ $labels.pod }} CPU usage is {{ $value | humanizePercentage }}"
```

## Troubleshooting

### Common Issues

#### 1. Pods Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n formula-nebula

# Check logs
kubectl logs <pod-name> -n formula-nebula

# Common issues:
# - Image pull errors: Check registry credentials
# - Resource limits: Increase CPU/memory requests
# - ConfigMap/Secret missing: Verify they exist
```

#### 2. High Latency

```bash
# Check pod resources
kubectl top pods -n formula-nebula

# Check node resources
kubectl top nodes

# Scale up if needed
kubectl scale deployment formula-nebula-web --replicas=20 -n formula-nebula
```

#### 3. WebSocket Connection Issues

```bash
# Check ingress configuration
kubectl get ingress formula-nebula-ws-ingress -n formula-nebula -o yaml

# Check collaboration pods
kubectl logs -l component=collaboration -n formula-nebula --tail=100

# Verify sticky sessions
kubectl describe service formula-nebula-collab -n formula-nebula
```

#### 4. Database Connection Errors

```bash
# Check PostgreSQL status
kubectl exec -it postgres-0 -n formula-nebula -- pg_isready

# Check connections
kubectl exec -it postgres-0 -n formula-nebula -- psql -U formula_user -d formula_nebula -c "SELECT count(*) FROM pg_stat_activity;"

# Check logs
kubectl logs postgres-0 -n formula-nebula
```

### Debug Commands

```bash
# Interactive shell in pod
kubectl exec -it <pod-name> -n formula-nebula -- /bin/sh

# Port forward for local testing
kubectl port-forward svc/formula-nebula-web 8080:80 -n formula-nebula
kubectl port-forward svc/formula-nebula-collab 8081:8080 -n formula-nebula

# View events
kubectl get events -n formula-nebula --sort-by='.lastTimestamp'

# Restart deployment
kubectl rollout restart deployment/formula-nebula-web -n formula-nebula
```

## Disaster Recovery

### Backup Strategy

1. **Database Backups**: Automated daily via CronJob
2. **Volume Snapshots**: Cloud provider snapshots
3. **Config Backups**: Store in version control

### Restore Procedure

```bash
# Restore from backup
kubectl exec -it postgres-0 -n formula-nebula -- bash
gunzip < /backup/postgres-backup-YYYYMMDD-HHMMSS.sql.gz | psql -U formula_user -d formula_nebula

# Verify data
psql -U formula_user -d formula_nebula -c "SELECT COUNT(*) FROM users;"
```

## Maintenance

### Rolling Updates

```bash
# Update image
kubectl set image deployment/formula-nebula-web web=$REGISTRY/formula-nebula-web:v1.1.0 -n formula-nebula

# Monitor rollout
kubectl rollout status deployment/formula-nebula-web -n formula-nebula

# Rollback if needed
kubectl rollout undo deployment/formula-nebula-web -n formula-nebula
```

### Certificate Renewal

Cert-manager handles automatic renewal. To force renewal:

```bash
# Delete secret to force renewal
kubectl delete secret formula-nebula-tls -n formula-nebula

# Certificate will be automatically recreated
kubectl get certificate -n formula-nebula
```

## Cost Optimization

1. **Right-size resources**: Use VPA recommendations
2. **Spot instances**: Use for non-critical workloads
3. **Reserved instances**: For baseline capacity
4. **Storage optimization**: Use appropriate storage classes
5. **Scale down during off-peak**: Adjust min replicas

## Security Checklist

- [ ] Secrets encrypted at rest
- [ ] Network policies enabled
- [ ] RBAC configured
- [ ] Pod security policies/standards applied
- [ ] Container images scanned for vulnerabilities
- [ ] TLS/SSL enabled for all external endpoints
- [ ] Database encryption enabled
- [ ] Regular security updates applied
- [ ] Audit logging enabled
- [ ] Backup encryption enabled

## Support

For issues or questions:
- GitHub Issues: https://github.com/your-org/formula-nebula/issues
- Documentation: https://docs.formula-nebula.com
- Email: support@formula-nebula.com

---

**Last Updated**: 2026-11-02
**Version**: 1.0.0
