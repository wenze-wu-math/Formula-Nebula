#!/bin/bash

# Formula Nebula Monitoring Stack Setup Script
# This script helps you set up the complete monitoring infrastructure

set -e

echo "🚀 Formula Nebula Monitoring Stack Setup"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p /var/lib/prometheus/data
mkdir -p /var/log/formula-nebula

echo "✅ Directories created"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << EOF
# Monitoring Configuration
NODE_ENV=production
SERVICE_NAME=formula-nebula

# Endpoints
METRICS_ENDPOINT=/metrics
LOGS_ENDPOINT=http://localhost:5000
TRACING_ENDPOINT=http://localhost:14268/api/traces

# PagerDuty Integration
PAGERDUTY_INTEGRATION_KEY=

# Alert Thresholds
ALERT_ERROR_RATE=5.0
ALERT_RESPONSE_TIME=1000
ALERT_MEMORY_THRESHOLD=85

# Grafana
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=admin

# Slack (optional)
SLACK_WEBHOOK_URL=

# Email (optional)
EMAIL_SMTP_HOST=
EMAIL_SMTP_PORT=587
EMAIL_FROM=
EMAIL_PASSWORD=
EOF
    echo "✅ .env file created. Please edit it with your credentials."
    echo ""
fi

# Prompt for PagerDuty key
read -p "Do you want to configure PagerDuty now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your PagerDuty integration key: " PAGERDUTY_KEY
    if [ ! -z "$PAGERDUTY_KEY" ]; then
        # Update .env file
        sed -i "s/PAGERDUTY_INTEGRATION_KEY=/PAGERDUTY_INTEGRATION_KEY=${PAGERDUTY_KEY}/" .env

        # Update alertmanager.yaml
        sed -i "s/<PAGERDUTY_INTEGRATION_KEY_CRITICAL>/${PAGERDUTY_KEY}/" alertmanager.yaml
        sed -i "s/<PAGERDUTY_INTEGRATION_KEY_WARNING>/${PAGERDUTY_KEY}/" alertmanager.yaml

        echo "✅ PagerDuty configured"
    fi
fi
echo ""

# Start the stack
read -p "Do you want to start the monitoring stack now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting monitoring stack..."
    docker-compose up -d

    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 10

    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        echo "✅ Monitoring stack started successfully!"
        echo ""
        echo "📊 Access your dashboards:"
        echo "  • Grafana:       http://localhost:3001 (admin/admin)"
        echo "  • Prometheus:    http://localhost:9090"
        echo "  • Jaeger:        http://localhost:16686"
        echo "  • Kibana:        http://localhost:5601"
        echo "  • Alertmanager:  http://localhost:9093"
        echo ""
        echo "📝 Next steps:"
        echo "  1. Change Grafana admin password"
        echo "  2. Configure PagerDuty integration (if not done)"
        echo "  3. Customize alert thresholds in alerts.yaml"
        echo "  4. Integrate monitoring into your application (see README.md)"
        echo ""
    else
        echo "❌ Some services failed to start. Check logs with:"
        echo "   docker-compose logs"
    fi
fi

# Create Kibana index pattern
read -p "Do you want to configure Kibana index pattern? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⏳ Waiting for Kibana to be ready..."
    sleep 30

    echo "📊 Creating Kibana index pattern..."
    curl -X POST "http://localhost:5601/api/saved_objects/index-pattern/formula-nebula-logs" \
         -H 'kbn-xsrf: true' \
         -H 'Content-Type: application/json' \
         -d '{
           "attributes": {
             "title": "formula-nebula-logs-*",
             "timeFieldName": "@timestamp"
           }
         }' 2>/dev/null

    if [ $? -eq 0 ]; then
        echo "✅ Kibana index pattern created"
    else
        echo "⚠️  Failed to create index pattern. You can create it manually in Kibana."
    fi
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📚 Documentation: monitoring/README.md"
echo "🐛 Issues? Check docker-compose logs or visit the documentation"
echo ""
