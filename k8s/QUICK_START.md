# Quick Start Guide

This guide will help you deploy Formula Nebula to Kubernetes in under 30 minutes.

## Prerequisites

- Kubernetes cluster (1.28+) with at least 3 nodes
- kubectl configured
- Docker registry access
- Domain name (optional, can use IP initially)

## 1. Quick Setup Script

Save this as `deploy.sh` and run it:

```bash
#!/bin/bash
set -e

echo "Formula Nebula - Quick Deployment Script"
echo "========================================="

# Configuration
NAMESPACE="formula-nebula"
REGISTRY="your-registry.com"  # Change this
VERSION="v1.0.0"

echo "Using namespace: $NAMESPACE"
echo "Using registry: $REGISTRY"

# Step 1: Create namespace
echo "[1/8] Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Step 2: Generate secrets
echo "[2/8] Generating secrets..."
DB_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: formula-nebula-secrets
  namespace: $NAMESPACE
type: Opaque
data:
  DB_PASSWORD: $(echo -n "$DB_PASSWORD" | base64)
  DB_USERNAME: $(echo -n "formula_user" | base64)
  REDIS_PASSWORD: $(echo -n "$REDIS_PASSWORD" | base64)
  JWT_SECRET: $(echo -n "$JWT_SECRET" | base64)
  API_KEY: $(echo -n "your-api-key" | base64)
  SESSION_SECRET: $(echo -n "session-secret" | base64)
EOF

# Step 3: Apply configurations
echo "[3/8] Applying configurations..."
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/storage.yaml

# Step 4: Deploy databases
echo "[4/8] Deploying databases..."
kubectl apply -f k8s/statefulset-db.yaml
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s

# Step 5: Deploy services
echo "[5/8] Deploying services..."
kubectl apply -f k8s/service.yaml

# Step 6: Deploy applications
echo "[6/8] Deploying applications..."
kubectl apply -f k8s/deployment.yaml
kubectl rollout status deployment/formula-nebula-web -n $NAMESPACE --timeout=300s
kubectl rollout status deployment/formula-nebula-collab -n $NAMESPACE --timeout=300s

# Step 7: Configure ingress
echo "[7/8] Configuring ingress..."
kubectl apply -f k8s/ingress.yaml

# Step 8: Enable autoscaling
echo "[8/8] Enabling autoscaling..."
kubectl apply -f k8s/autoscale.yaml

echo ""
echo "Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Get ingress IP: kubectl get ingress -n $NAMESPACE"
echo "2. Update your DNS to point to the ingress IP"
echo "3. Monitor pods: kubectl get pods -n $NAMESPACE -w"
echo "4. Check logs: kubectl logs -l app=formula-nebula -n $NAMESPACE"
echo ""
echo "Database credentials (save these securely):"
echo "PostgreSQL Password: $DB_PASSWORD"
echo "Redis Password: $REDIS_PASSWORD"
echo "JWT Secret: $JWT_SECRET"
```

Make it executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 2. Manual Deployment (Step by Step)

### Step 1: Build Images

```bash
# Build and push web frontend
docker build -f Dockerfile.web -t your-registry.com/formula-nebula-web:v1.0.0 .
docker push your-registry.com/formula-nebula-web:v1.0.0

# Build and push collaboration server
docker build -f Dockerfile.collab -t your-registry.com/formula-nebula-collab:v1.0.0 .
docker push your-registry.com/formula-nebula-collab:v1.0.0
```

### Step 2: Update Configuration

```bash
# Edit deployment.yaml to use your images
sed -i 's|formula-nebula/web:latest|your-registry.com/formula-nebula-web:v1.0.0|g' k8s/deployment.yaml
sed -i 's|formula-nebula/collab:latest|your-registry.com/formula-nebula-collab:v1.0.0|g' k8s/deployment.yaml

# Update domain in ingress.yaml
sed -i 's|formula-nebula.com|your-domain.com|g' k8s/ingress.yaml
```

### Step 3: Deploy

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/storage.yaml

# Deploy databases
kubectl apply -f k8s/statefulset-db.yaml

# Wait for databases
kubectl wait --for=condition=ready pod -l app=postgres -n formula-nebula --timeout=300s

# Deploy services and apps
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/deployment.yaml

# Configure ingress
kubectl apply -f k8s/ingress.yaml

# Enable autoscaling
kubectl apply -f k8s/autoscale.yaml
```

## 3. Verify Deployment

```bash
# Check all resources
kubectl get all -n formula-nebula

# Get ingress URL
kubectl get ingress -n formula-nebula

# Check pod logs
kubectl logs -l app=formula-nebula -n formula-nebula --tail=50

# Test the application
curl -k https://your-ingress-ip
```

## 4. Access the Application

### Option A: Using LoadBalancer IP

```bash
# Get the ingress IP
INGRESS_IP=$(kubectl get ingress formula-nebula-ingress -n formula-nebula -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Access the application
echo "Web: https://$INGRESS_IP"
echo "WebSocket: wss://$INGRESS_IP:8080"

# Add to /etc/hosts for testing
echo "$INGRESS_IP formula-nebula.local" | sudo tee -a /etc/hosts
```

### Option B: Port Forward (Development)

```bash
# Forward web port
kubectl port-forward -n formula-nebula svc/formula-nebula-web 8080:80

# Forward WebSocket port
kubectl port-forward -n formula-nebula svc/formula-nebula-collab 8081:8080

# Access locally
echo "Web: http://localhost:8080"
echo "WebSocket: ws://localhost:8081"
```

## 5. Common Commands

```bash
# Watch pods
kubectl get pods -n formula-nebula -w

# Scale manually
kubectl scale deployment formula-nebula-web --replicas=20 -n formula-nebula

# Restart deployment
kubectl rollout restart deployment/formula-nebula-web -n formula-nebula

# View logs
kubectl logs -f deployment/formula-nebula-web -n formula-nebula

# Execute shell in pod
kubectl exec -it deployment/formula-nebula-web -n formula-nebula -- /bin/sh

# Check resource usage
kubectl top pods -n formula-nebula
kubectl top nodes
```

## 6. Monitoring

```bash
# Install metrics-server (if not installed)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Watch autoscaling
kubectl get hpa -n formula-nebula -w

# Check events
kubectl get events -n formula-nebula --sort-by='.lastTimestamp'
```

## 7. Load Testing

Simple load test with Apache Bench:

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Run load test
ab -n 10000 -c 100 https://your-domain.com/

# For WebSocket testing, use wscat
npm install -g wscat
for i in {1..1000}; do wscat -c wss://ws.your-domain.com & done
```

## 8. Backup

```bash
# Backup PostgreSQL manually
kubectl exec postgres-0 -n formula-nebula -- pg_dump -U formula_user formula_nebula | gzip > backup-$(date +%Y%m%d).sql.gz

# Restore from backup
gunzip < backup-20261102.sql.gz | kubectl exec -i postgres-0 -n formula-nebula -- psql -U formula_user -d formula_nebula
```

## 9. Cleanup

```bash
# Delete everything
kubectl delete namespace formula-nebula

# Or delete specific resources
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/statefulset-db.yaml
kubectl delete -f k8s/service.yaml
kubectl delete -f k8s/ingress.yaml
```

## Troubleshooting

### Pods not starting

```bash
# Describe the pod
kubectl describe pod <pod-name> -n formula-nebula

# Check events
kubectl get events -n formula-nebula | grep <pod-name>

# Check logs
kubectl logs <pod-name> -n formula-nebula --previous
```

### Can't access the application

```bash
# Check ingress
kubectl describe ingress -n formula-nebula

# Check services
kubectl get svc -n formula-nebula

# Check if pods are ready
kubectl get pods -n formula-nebula
```

### Database connection issues

```bash
# Test PostgreSQL
kubectl exec postgres-0 -n formula-nebula -- pg_isready

# Connect to PostgreSQL
kubectl exec -it postgres-0 -n formula-nebula -- psql -U formula_user -d formula_nebula

# Check Redis
kubectl exec redis-0 -n formula-nebula -- redis-cli ping
```

## Next Steps

- Configure SSL/TLS certificates with cert-manager
- Set up monitoring with Prometheus and Grafana
- Configure backup schedules
- Implement CI/CD pipeline
- Review security policies

See `DEPLOYMENT_GUIDE.md` for detailed information.
