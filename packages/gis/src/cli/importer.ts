#!/usr/bin/env tsx
/**
 * GeoJSON Import CLI Tool
 *
 * Usage:
 *   npm run import -- --file path/to/file.geojson --event EVENT_ID [options]
 *
 * Options:
 *   --file, -f      Path to GeoJSON file (required)
 *   --event, -e     Event ID (required)
 *   --type, -t      Default feature type (optional, default: zone)
 *   --workcenter, -w Default workcenter access (optional, default: operations)
 *   --dry-run       Preview import without saving to database
 */

import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { parseGeoJSON, validateGeoJSON, getGeoJSONStats } from '../geojson-parser.js';
import { db, venueFeatures } from '@c2/database';

interface CLIOptions {
  file?: string;
  event?: string;
  type?: string;
  workcenter?: string;
  dryRun?: boolean;
  help?: boolean;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help || !options.file || !options.event) {
    printHelp();
    process.exit(options.help ? 0 : 1);
  }

  try {
    console.log('🗺️  GeoJSON Import Tool\n');

    // Read GeoJSON file
    console.log(`📂 Reading file: ${options.file}`);
    const filePath = resolve(process.cwd(), options.file);
    const fileContent = await readFile(filePath, 'utf-8');
    const geojson = JSON.parse(fileContent);

    // Validate GeoJSON
    console.log('✓ Validating GeoJSON...');
    if (!validateGeoJSON(geojson)) {
      throw new Error('Invalid GeoJSON format');
    }
    console.log('✓ GeoJSON is valid\n');

    // Get statistics
    const stats = getGeoJSONStats(geojson);
    console.log('📊 GeoJSON Statistics:');
    console.log(`   Total Features: ${stats.totalFeatures}`);
    console.log('   By Type:');
    for (const [type, count] of Object.entries(stats.byGeometryType)) {
      console.log(`     - ${type}: ${count}`);
    }
    if (stats.bounds) {
      console.log(`   Bounds: (${stats.bounds.minLat.toFixed(6)}, ${stats.bounds.minLng.toFixed(6)}) to (${stats.bounds.maxLat.toFixed(6)}, ${stats.bounds.maxLng.toFixed(6)})`);
      console.log(`   Center: (${stats.bounds.center.lat.toFixed(6)}, ${stats.bounds.center.lng.toFixed(6)})`);
    }
    console.log('');

    // Parse features
    console.log('🔄 Parsing features...');
    const defaultType = (options.type as any) || 'zone';
    const defaultWorkcenter = options.workcenter ? [options.workcenter] : ['operations'];

    const features = parseGeoJSON(geojson, options.event, defaultType, defaultWorkcenter);
    console.log(`✓ Parsed ${features.length} features\n`);

    // Preview first few features
    console.log('📋 Preview (first 3 features):');
    features.slice(0, 3).forEach((feature, index) => {
      console.log(`   ${index + 1}. ${feature.name} (${feature.featureType})`);
      console.log(`      Category: ${feature.featureCategory}`);
      console.log(`      Workcenters: ${feature.workcenterAccess.join(', ')}`);
    });
    console.log('');

    if (options.dryRun) {
      console.log('🔍 Dry run - no data was imported');
      process.exit(0);
    }

    // Import to database
    console.log('💾 Importing to database...');
    const startTime = Date.now();

    const imported = await db.insert(venueFeatures).values(features as any).returning();

    const duration = Date.now() - startTime;
    console.log(`✓ Imported ${imported.length} features in ${duration}ms\n`);

    console.log('✅ Import complete!');
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

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--file':
      case '-f':
        options.file = args[++i];
        break;
      case '--event':
      case '-e':
        options.event = args[++i];
        break;
      case '--type':
      case '-t':
        options.type = args[++i];
        break;
      case '--workcenter':
      case '-w':
        options.workcenter = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
🗺️  GeoJSON Import Tool

USAGE:
  npm run import -- --file FILE --event EVENT_ID [OPTIONS]

REQUIRED:
  --file, -f FILE          Path to GeoJSON file
  --event, -e EVENT_ID     Event ID to associate features with

OPTIONS:
  --type, -t TYPE          Default feature type (default: zone)
  --workcenter, -w NAME    Default workcenter access (default: operations)
  --dry-run                Preview import without saving
  --help, -h               Show this help

EXAMPLES:
  # Import Burning Man CPNs
  npm run import -- -f ../innovate-GIS-data/2025/GeoJSON/cpns.geojson -e event-123

  # Dry run to preview
  npm run import -- -f data.geojson -e event-123 --dry-run

  # Import with custom defaults
  npm run import -- -f gates.geojson -e event-123 -t gate -w security

FEATURE TYPES:
  stage, gate, vendor_booth, sound_booth, medical_tent, security_post,
  restroom, water_station, art_installation, vip_area, pathway, road,
  fence, parking_lot, command_center, production_office, warehouse,
  generator, zone, boundary

WORKCENTERS:
  operations, production, security, workforce, vendors, sponsors,
  marketing, finance
`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
