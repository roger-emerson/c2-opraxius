#!/bin/bash
#
# Seed Staging Database
#
# This script creates a test event and imports test GeoJSON data
# to the staging database.
#
# Usage:
#   DATABASE_URL=<your-staging-db-url> ./scripts/seed-staging.sh
#
# Or set DATABASE_URL as environment variable first:
#   export DATABASE_URL=<your-staging-db-url>
#   ./scripts/seed-staging.sh
#

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 Staging Database Seed Script${NC}\n"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
    echo "Usage: DATABASE_URL=<your-db-url> ./scripts/seed-staging.sh"
    exit 1
fi

# Ensure we're in the right directory
cd "$(dirname "$0")/.."

echo -e "${GREEN}Step 1: Installing dependencies${NC}"
npm install

echo -e "\n${GREEN}Step 2: Building workspace packages${NC}"
npm run build --workspace=@c2/shared
npm run build --workspace=@c2/database
npm run build --workspace=@c2/gis

echo -e "\n${GREEN}Step 3: Creating test event${NC}"
cd packages/database
npm run db:seed

# Capture the event ID from the seed output
# For now, we'll use a known test event ID or query it
EVENT_ID=$(DATABASE_URL=$DATABASE_URL npx tsx -e "
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

echo -e "\n${GREEN}Step 4: Importing GeoJSON test data${NC}"
cd ../gis
npm run import -- -f examples/test-venue.geojson -e "$EVENT_ID"

echo -e "\n${GREEN}✅ Staging database seeded successfully!${NC}"
echo -e "\nYou can now view the map at: ${BLUE}https://staging.web.opraxius.com/dashboard/map${NC}\n"
