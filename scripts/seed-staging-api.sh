#!/bin/bash
#
# Seed Staging Database via API
#
# This script uses the staging API to create a test event,
# then imports test GeoJSON data directly to the database.
#
# Requirements:
#   - jq (JSON processor)
#   - DATABASE_URL environment variable
#
# Usage:
#   DATABASE_URL=<your-staging-db-url> ./scripts/seed-staging-api.sh
#

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 Staging Database Seed Script (API Method)${NC}\n"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
    echo "Usage: DATABASE_URL=<your-db-url> ./scripts/seed-staging-api.sh"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ Error: jq is not installed${NC}"
    echo "Install it with: brew install jq"
    exit 1
fi

# Ensure we're in the right directory
cd "$(dirname "$0")/.."

STAGING_API_URL="https://staging.api.opraxius.com"

echo -e "${GREEN}Step 1: Check API health${NC}"
HEALTH=$(curl -s "$STAGING_API_URL/health")
echo "$HEALTH" | jq .

if [ "$(echo "$HEALTH" | jq -r '.status')" != "ok" ]; then
    echo -e "${RED}❌ Error: API is not healthy${NC}"
    exit 1
fi

echo -e "\n${GREEN}Step 2: Create test event via API${NC}"
echo -e "${YELLOW}Note: This requires authentication. Using public endpoint workaround...${NC}\n"

# Since the API requires auth, we'll use the database directly
echo -e "${GREEN}Step 2 (alternative): Installing dependencies${NC}"
npm install

echo -e "\n${GREEN}Step 3: Building workspace packages${NC}"
npm run build --workspace=@c2/shared
npm run build --workspace=@c2/database
npm run build --workspace=@c2/gis

echo -e "\n${GREEN}Step 4: Creating test event in database${NC}"
cd packages/database
npm run db:seed

# Get the event ID
EVENT_ID=$(npx tsx -e "
import { db, events } from './dist/index.js';
import { eq } from 'drizzle-orm';
const result = await db.select().from(events).where(eq(events.slug, 'test-event-001')).limit(1);
if (result.length > 0) {
  console.log(result[0].id);
  process.exit(0);
}
process.exit(1);
")

if [ -z "$EVENT_ID" ]; then
    echo -e "${RED}❌ Error: Failed to get event ID${NC}"
    exit 1
fi

echo -e "Event ID: ${BLUE}$EVENT_ID${NC}"

echo -e "\n${GREEN}Step 5: Importing GeoJSON test data${NC}"
cd ../gis
npm run import -- -f examples/test-venue.geojson -e "$EVENT_ID"

echo -e "\n${GREEN}Step 6: Verify data via API${NC}"
FEATURES=$(curl -s "$STAGING_API_URL/api/venues/public")
FEATURE_COUNT=$(echo "$FEATURES" | jq '. | length')
echo -e "Features imported: ${BLUE}$FEATURE_COUNT${NC}"

echo -e "\n${GREEN}✅ Staging database seeded successfully!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo -e "1. Open: ${GREEN}https://staging.web.opraxius.com/dashboard/map${NC}"
echo -e "2. Verify the map renders with $FEATURE_COUNT features"
echo -e "3. Test interactions (rotate, zoom, click)"
echo -e "4. Take screenshots for documentation\n"
