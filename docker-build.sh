#!/usr/bin/env bash

# ==========================================
# Formula Nebula - Docker Build Script
# ==========================================
# Builds all Docker images and reports sizes
# ==========================================

set -e

echo "=========================================="
echo "  Formula Nebula - Docker Build"
echo "=========================================="
echo ""

# Build stages
STAGES=("builder" "runtime" "development")

for STAGE in "${STAGES[@]}"; do
    echo "Building ${STAGE} stage..."
    docker build \
        --target "${STAGE}" \
        -t "formula-nebula:${STAGE}" \
        -f Dockerfile \
        .
    echo "✓ ${STAGE} stage built successfully"
    echo ""
done

echo "=========================================="
echo "  Build Summary"
echo "=========================================="
echo ""

# Display image sizes
docker images | grep "formula-nebula" | awk '{printf "%-30s %-15s %-15s\n", $1":"$2, $7" "$8, $3}'

echo ""
echo "=========================================="
echo "  Testing Images"
echo "=========================================="
echo ""

# Test runtime image
echo "Testing runtime image..."
docker run --rm formula-nebula:runtime node --version
docker run --rm formula-nebula:runtime npm --version
echo "✓ Runtime image works"
echo ""

# Test development image
echo "Testing development image..."
docker run --rm formula-nebula:development node --version
docker run --rm formula-nebula:development npm --version
echo "✓ Development image works"
echo ""

echo "=========================================="
echo "  All builds completed successfully!"
echo "=========================================="
echo ""
echo "To run the application:"
echo "  Production:  docker-compose up app"
echo "  Development: docker-compose --profile dev up app-dev"
echo "  All:         docker-compose up"
echo ""
