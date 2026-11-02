#!/bin/bash
# Install database layer dependencies
# Usage: ./install-db-deps.sh [sqlite|postgresql|mongodb|redis|all]

set -e

echo "Formula Nebula - Database Dependencies Installer"
echo "================================================"
echo ""

install_sqlite() {
  echo "Installing SQLite support..."
  npm install better-sqlite3
  echo "✓ SQLite ready"
}

install_postgresql() {
  echo "Installing PostgreSQL support..."
  npm install pg
  echo "✓ PostgreSQL ready"
}

install_mongodb() {
  echo "Installing MongoDB support..."
  npm install mongodb
  echo "✓ MongoDB ready"
}

install_redis() {
  echo "Installing Redis support..."
  npm install redis
  echo "✓ Redis ready"
}

install_all() {
  install_sqlite
  install_postgresql
  install_mongodb
  install_redis
  echo ""
  echo "✓ All database dependencies installed"
}

case "$1" in
  sqlite)
    install_sqlite
    ;;
  postgresql|postgres|pg)
    install_postgresql
    ;;
  mongodb|mongo)
    install_mongodb
    ;;
  redis)
    install_redis
    ;;
  all|"")
    install_all
    ;;
  *)
    echo "Unknown option: $1"
    echo "Usage: $0 [sqlite|postgresql|mongodb|redis|all]"
    exit 1
    ;;
esac

echo ""
echo "Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Configure your database in .env"
echo "  2. Run migrations: node kb-src/migrate.mjs up"
echo "  3. Test setup: node kb-src/db-examples.mjs"
