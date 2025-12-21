#!/usr/bin/env tsx
/**
 * Database Seed Script
 *
 * Creates a test event for importing GeoJSON data
 *
 * Usage:
 *   DATABASE_URL=<your-database-url> npm run db:seed
 */

import { db, events } from './index.js';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('🌱 Seeding database...\n');

  try {
    // Check if test event already exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(eq(events.slug, 'test-event-001'))
      .limit(1);

    if (existingEvent.length > 0) {
      console.log('✓ Test event already exists:');
      console.log(`   ID: ${existingEvent[0].id}`);
      console.log(`   Name: ${existingEvent[0].name}`);
      console.log(`   Slug: ${existingEvent[0].slug}\n`);
      console.log('Use this event ID for importing GeoJSON data:\n');
      console.log(`   npm run import -- -f examples/test-venue.geojson -e ${existingEvent[0].id}\n`);
      process.exit(0);
    }

    // Create test event
    console.log('Creating test event...');
    const [newEvent] = await db.insert(events).values({
      name: 'Test Event - EDC Las Vegas 2025',
      slug: 'test-event-001',
      eventType: 'edc_las_vegas',
      startDate: new Date('2025-05-16T00:00:00Z'),
      endDate: new Date('2025-05-18T23:59:59Z'),
      status: 'planning',
      venueBounds: null, // PostGIS geometry (optional for now)
      venueLocation: null, // PostGIS geography (optional for now)
    }).returning();

    console.log('✓ Test event created successfully!\n');
    console.log('Event Details:');
    console.log(`   ID: ${newEvent.id}`);
    console.log(`   Name: ${newEvent.name}`);
    console.log(`   Slug: ${newEvent.slug}`);
    console.log(`   Type: ${newEvent.eventType}`);
    console.log(`   Status: ${newEvent.status}\n`);

    console.log('Next step: Import GeoJSON data using this command:\n');
    console.log(`   cd packages/gis`);
    console.log(`   npm run import -- -f examples/test-venue.geojson -e ${newEvent.id}\n`);

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
