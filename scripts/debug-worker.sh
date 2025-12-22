#!/bin/bash
# Debug script for Opraxius C2 Cloudflare Workers
# Usage: ./scripts/debug-worker.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
WORKER_NAME="c2-api-${ENVIRONMENT}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔍 Opraxius C2 Worker Debugger"
echo "======================================"
echo "Environment: $ENVIRONMENT"
echo "Worker: $WORKER_NAME"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Install with: npm install -g wrangler"
    exit 1
fi

# Check authentication
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not authenticated. Run: wrangler login"
    echo ""
    echo "Or set CLOUDFLARE_API_TOKEN environment variable:"
    echo "  export CLOUDFLARE_API_TOKEN='your-token-here'"
    exit 1
fi

echo "✅ Authenticated!"
echo ""

# Menu
echo "Select debug option:"
echo "  1) Stream all logs (wrangler tail)"
echo "  2) Stream errors only"
echo "  3) Stream with request details"
echo "  4) Run locally with remote bindings"
echo "  5) Check worker status"
echo "  6) View recent deployments"
echo ""
read -p "Enter option (1-6): " option

cd "$PROJECT_DIR/apps/api-workers"

case $option in
    1)
        echo ""
        echo "📡 Streaming all logs from $WORKER_NAME..."
        echo "Press Ctrl+C to stop"
        echo ""
        wrangler tail "$WORKER_NAME"
        ;;
    2)
        echo ""
        echo "🔴 Streaming errors only from $WORKER_NAME..."
        echo "Press Ctrl+C to stop"
        echo ""
        wrangler tail "$WORKER_NAME" --status error
        ;;
    3)
        echo ""
        echo "📋 Streaming with full request details from $WORKER_NAME..."
        echo "Press Ctrl+C to stop"
        echo ""
        wrangler tail "$WORKER_NAME" --format pretty
        ;;
    4)
        echo ""
        echo "🖥️  Starting local dev server with remote bindings..."
        echo "API will be available at http://localhost:8787"
        echo ""
        wrangler dev -c "wrangler.${ENVIRONMENT}.toml" --remote
        ;;
    5)
        echo ""
        echo "📊 Checking worker status..."
        wrangler deployments list --name "$WORKER_NAME"
        ;;
    6)
        echo ""
        echo "📜 Recent deployments for $WORKER_NAME:"
        wrangler deployments list --name "$WORKER_NAME" --limit 10
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

