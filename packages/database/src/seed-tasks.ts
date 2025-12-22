#!/usr/bin/env tsx
/**
 * Task Seed Script - Event Management Tasks
 *
 * Creates 15-30 realistic event management tasks for each workcenter:
 * - Operations (30 tasks)
 * - Production (25 tasks)
 * - Security (25 tasks)
 * - Workforce (20 tasks)
 * - Vendors (20 tasks)
 * - Marketing (15 tasks)
 * - Finance (15 tasks)
 *
 * Tasks are linked to venue features where applicable for 3D map display.
 *
 * Usage:
 *   DATABASE_URL=<your-database-url> npm run db:seed-tasks
 */

import { db, events, tasks, activityFeed } from './index.js';
import { eq, sql } from 'drizzle-orm';

// Task templates for each department
interface TaskTemplate {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isCriticalPath: boolean;
  featureTypes?: string[]; // Which feature types this task can be linked to
  daysBeforeEvent: number; // Due date relative to event start
}

// OPERATIONS TASKS (30)
const operationsTasks: TaskTemplate[] = [
  { title: 'Establish Command Center Operations', description: 'Set up main operations hub with communication equipment, monitors, and coordination stations', priority: 'critical', isCriticalPath: true, featureTypes: ['command_center'], daysBeforeEvent: 14 },
  { title: 'Configure Radio Communication Network', description: 'Set up and test all radio frequencies for inter-department communication', priority: 'critical', isCriticalPath: true, daysBeforeEvent: 7 },
  { title: 'Install Venue Signage & Wayfinding', description: 'Place directional signs, stage markers, and emergency exit indicators throughout venue', priority: 'high', isCriticalPath: true, featureTypes: ['gate', 'stage', 'pathway'], daysBeforeEvent: 3 },
  { title: 'Coordinate Power Distribution Grid', description: 'Map and verify power distribution to all stages, vendors, and facilities', priority: 'critical', isCriticalPath: true, featureTypes: ['generator', 'stage'], daysBeforeEvent: 5 },
  { title: 'Set Up Water Distribution System', description: 'Install and test water stations, ensure adequate pressure and supply', priority: 'high', isCriticalPath: true, featureTypes: ['water_station'], daysBeforeEvent: 4 },
  { title: 'Deploy Portable Restroom Facilities', description: 'Position and service all portable restroom units per capacity calculations', priority: 'high', isCriticalPath: true, featureTypes: ['restroom'], daysBeforeEvent: 2 },
  { title: 'Establish Medical Station Protocols', description: 'Coordinate with medical team on triage procedures and emergency response', priority: 'critical', isCriticalPath: true, featureTypes: ['medical_tent'], daysBeforeEvent: 3 },
  { title: 'Configure Crowd Flow Barriers', description: 'Install and position crowd control barriers for optimal flow management', priority: 'high', isCriticalPath: false, featureTypes: ['fence', 'pathway'], daysBeforeEvent: 2 },
  { title: 'Test Emergency Evacuation Routes', description: 'Walk through and verify all emergency exit routes are clear and marked', priority: 'critical', isCriticalPath: true, featureTypes: ['gate', 'pathway'], daysBeforeEvent: 1 },
  { title: 'Calibrate Weather Monitoring System', description: 'Set up weather stations and configure alert thresholds for wind/lightning', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 7 },
  { title: 'Coordinate Parking Lot Operations', description: 'Set up parking attendant stations and traffic flow patterns', priority: 'high', isCriticalPath: false, featureTypes: ['parking_lot'], daysBeforeEvent: 2 },
  { title: 'Install Temporary Fencing Perimeter', description: 'Complete venue perimeter fencing installation and security checks', priority: 'critical', isCriticalPath: true, featureTypes: ['fence', 'boundary'], daysBeforeEvent: 4 },
  { title: 'Configure Lost & Found Station', description: 'Set up lost and found area with inventory tracking system', priority: 'low', isCriticalPath: false, daysBeforeEvent: 1 },
  { title: 'Establish ADA Accessibility Routes', description: 'Verify all ADA-compliant pathways and viewing areas are accessible', priority: 'high', isCriticalPath: true, featureTypes: ['pathway', 'stage'], daysBeforeEvent: 2 },
  { title: 'Deploy Trash & Recycling Stations', description: 'Position waste management stations throughout venue per capacity plan', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 2 },
  { title: 'Test PA System Coverage', description: 'Verify emergency announcement system reaches all venue areas', priority: 'critical', isCriticalPath: true, featureTypes: ['stage', 'command_center'], daysBeforeEvent: 2 },
  { title: 'Coordinate Transportation Hub', description: 'Set up rideshare pickup/dropoff zones and shuttle bus staging', priority: 'high', isCriticalPath: false, featureTypes: ['gate', 'parking_lot'], daysBeforeEvent: 1 },
  { title: 'Install Emergency Lighting System', description: 'Deploy backup lighting along all pathways and emergency exits', priority: 'high', isCriticalPath: true, featureTypes: ['pathway', 'gate'], daysBeforeEvent: 3 },
  { title: 'Configure Gate Entry Scanners', description: 'Set up and test all credential scanning equipment at entry points', priority: 'critical', isCriticalPath: true, featureTypes: ['gate'], daysBeforeEvent: 2 },
  { title: 'Establish VIP Operations Protocol', description: 'Coordinate VIP area access, services, and dedicated staff', priority: 'medium', isCriticalPath: false, featureTypes: ['vip_area'], daysBeforeEvent: 2 },
  { title: 'Deploy First Aid Supply Caches', description: 'Position first aid kits and AED devices at designated locations', priority: 'high', isCriticalPath: true, featureTypes: ['medical_tent', 'stage'], daysBeforeEvent: 1 },
  { title: 'Test Generator Backup Systems', description: 'Verify all backup generators are fueled and operational', priority: 'critical', isCriticalPath: true, featureTypes: ['generator'], daysBeforeEvent: 2 },
  { title: 'Configure Staff Check-in Stations', description: 'Set up credential verification points for all staff and vendors', priority: 'medium', isCriticalPath: false, featureTypes: ['gate', 'production_office'], daysBeforeEvent: 1 },
  { title: 'Install Temperature Control Equipment', description: 'Deploy misting fans, shade structures for heat mitigation', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 3 },
  { title: 'Coordinate Ambulance Staging Area', description: 'Designate and prepare ambulance access and staging zones', priority: 'critical', isCriticalPath: true, featureTypes: ['medical_tent', 'road'], daysBeforeEvent: 2 },
  { title: 'Set Up Information Booths', description: 'Position guest services information stations with maps and schedules', priority: 'medium', isCriticalPath: false, featureTypes: ['gate'], daysBeforeEvent: 1 },
  { title: 'Test Cell Signal Boosters', description: 'Verify mobile signal coverage and deploy boosters where needed', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 3 },
  { title: 'Establish Incident Reporting System', description: 'Configure digital incident logging and escalation procedures', priority: 'high', isCriticalPath: true, featureTypes: ['command_center'], daysBeforeEvent: 3 },
  { title: 'Coordinate Load-In Traffic Flow', description: 'Plan and execute vendor/production vehicle load-in schedule', priority: 'high', isCriticalPath: true, featureTypes: ['road', 'warehouse'], daysBeforeEvent: 5 },
  { title: 'Finalize Day-Of Operations Timeline', description: 'Complete minute-by-minute operations schedule and distribute to teams', priority: 'critical', isCriticalPath: true, featureTypes: ['command_center'], daysBeforeEvent: 1 },
];

// PRODUCTION TASKS (25)
const productionTasks: TaskTemplate[] = [
  { title: 'Complete Main Stage Rigging', description: 'Install all rigging points, motors, and safety cables for main stage', priority: 'critical', isCriticalPath: true, featureTypes: ['stage'], daysBeforeEvent: 4 },
  { title: 'Install Stage LED Screens', description: 'Mount and configure all LED video walls on main and secondary stages', priority: 'critical', isCriticalPath: true, featureTypes: ['stage'], daysBeforeEvent: 3 },
  { title: 'Configure Sound System - Main Stage', description: 'Install and tune main PA system, subwoofers, and delay towers', priority: 'critical', isCriticalPath: true, featureTypes: ['stage', 'sound_booth'], daysBeforeEvent: 3 },
  { title: 'Set Up DJ Booth Equipment', description: 'Install CDJs, mixers, and monitoring systems for all stages', priority: 'critical', isCriticalPath: true, featureTypes: ['stage', 'sound_booth'], daysBeforeEvent: 2 },
  { title: 'Install Pyrotechnics Systems', description: 'Set up flame effects, CO2 jets, and confetti cannons with safety protocols', priority: 'high', isCriticalPath: true, featureTypes: ['stage'], daysBeforeEvent: 2 },
  { title: 'Configure Lighting Control Systems', description: 'Program DMX controllers and test all intelligent lighting fixtures', priority: 'high', isCriticalPath: true, featureTypes: ['stage'], daysBeforeEvent: 2 },
  { title: 'Install Laser Safety Systems', description: 'Set up laser fixtures with proper safety zones and interlock systems', priority: 'high', isCriticalPath: true, featureTypes: ['stage'], daysBeforeEvent: 2 },
  { title: 'Set Up Artist Green Rooms', description: 'Prepare backstage areas with hospitality requirements per rider', priority: 'medium', isCriticalPath: false, featureTypes: ['production_office'], daysBeforeEvent: 1 },
  { title: 'Configure Stage Monitors', description: 'Set up and test in-ear monitor systems for performers', priority: 'high', isCriticalPath: true, featureTypes: ['stage', 'sound_booth'], daysBeforeEvent: 1 },
  { title: 'Install Video Switching Equipment', description: 'Set up video production truck and configure all camera feeds', priority: 'high', isCriticalPath: false, featureTypes: ['stage', 'production_office'], daysBeforeEvent: 2 },
  { title: 'Complete Secondary Stage Build', description: 'Finish construction and equipment installation for secondary stages', priority: 'critical', isCriticalPath: true, featureTypes: ['stage'], daysBeforeEvent: 3 },
  { title: 'Test All Intercom Systems', description: 'Verify production intercom connectivity between all positions', priority: 'high', isCriticalPath: true, featureTypes: ['stage', 'production_office', 'sound_booth'], daysBeforeEvent: 1 },
  { title: 'Program Stage Automation', description: 'Configure automated set changes and scenic elements', priority: 'medium', isCriticalPath: false, featureTypes: ['stage'], daysBeforeEvent: 2 },
  { title: 'Install Art Installation Lighting', description: 'Set up and program lighting for all art pieces', priority: 'medium', isCriticalPath: false, featureTypes: ['art_installation'], daysBeforeEvent: 2 },
  { title: 'Configure Stream/Broadcast Feed', description: 'Set up live stream encoding and verify internet uplinks', priority: 'medium', isCriticalPath: false, featureTypes: ['production_office'], daysBeforeEvent: 2 },
  { title: 'Test Emergency Stage Stops', description: 'Verify all emergency stop buttons and procedures work correctly', priority: 'critical', isCriticalPath: true, featureTypes: ['stage'], daysBeforeEvent: 1 },
  { title: 'Complete Sound Check Schedule', description: 'Execute sound checks for all performing artists', priority: 'high', isCriticalPath: true, featureTypes: ['stage', 'sound_booth'], daysBeforeEvent: 1 },
  { title: 'Install Backup Power Distribution', description: 'Connect and test UPS systems for all critical production equipment', priority: 'critical', isCriticalPath: true, featureTypes: ['generator', 'stage'], daysBeforeEvent: 2 },
  { title: 'Set Up Production Office', description: 'Configure production coordination hub with schedules and communications', priority: 'high', isCriticalPath: false, featureTypes: ['production_office'], daysBeforeEvent: 3 },
  { title: 'Finalize Set Times & Transitions', description: 'Lock in performance schedule and stage changeover timing', priority: 'critical', isCriticalPath: true, daysBeforeEvent: 2 },
  { title: 'Test Front of House Mix Position', description: 'Verify FOH engineer stations and equipment at all stages', priority: 'high', isCriticalPath: true, featureTypes: ['sound_booth'], daysBeforeEvent: 1 },
  { title: 'Install Stage Barricades', description: 'Position crowd barriers with proper gaps for security extraction', priority: 'high', isCriticalPath: true, featureTypes: ['stage'], daysBeforeEvent: 2 },
  { title: 'Configure Timecode Systems', description: 'Synchronize all lighting, video, and pyro to timecode triggers', priority: 'medium', isCriticalPath: false, featureTypes: ['stage', 'production_office'], daysBeforeEvent: 1 },
  { title: 'Complete Cable Management', description: 'Secure and label all production cabling, install cable ramps', priority: 'medium', isCriticalPath: false, featureTypes: ['stage', 'pathway'], daysBeforeEvent: 2 },
  { title: 'Final Production Walk-Through', description: 'Complete end-to-end production inspection with all department heads', priority: 'critical', isCriticalPath: true, featureTypes: ['stage'], daysBeforeEvent: 1 },
];

// SECURITY TASKS (25)
const securityTasks: TaskTemplate[] = [
  { title: 'Deploy Perimeter Security Team', description: 'Position security personnel at all fence line posts', priority: 'critical', isCriticalPath: true, featureTypes: ['fence', 'boundary'], daysBeforeEvent: 1 },
  { title: 'Set Up Metal Detection Stations', description: 'Install and calibrate walk-through and handheld metal detectors', priority: 'critical', isCriticalPath: true, featureTypes: ['gate'], daysBeforeEvent: 2 },
  { title: 'Configure Credential Verification System', description: 'Set up credential scanning for all access levels (GA, VIP, Artist)', priority: 'critical', isCriticalPath: true, featureTypes: ['gate'], daysBeforeEvent: 2 },
  { title: 'Establish Security Command Post', description: 'Set up security operations center with camera monitoring', priority: 'critical', isCriticalPath: true, featureTypes: ['command_center', 'security_post'], daysBeforeEvent: 3 },
  { title: 'Install CCTV Camera Network', description: 'Deploy and test all surveillance cameras throughout venue', priority: 'high', isCriticalPath: true, featureTypes: ['gate', 'stage', 'security_post'], daysBeforeEvent: 4 },
  { title: 'Train Crowd Management Team', description: 'Brief security on crowd crush protocols and emergency procedures', priority: 'critical', isCriticalPath: true, daysBeforeEvent: 2 },
  { title: 'Coordinate K-9 Sweep Schedule', description: 'Plan explosive detection K-9 sweeps before and during event', priority: 'high', isCriticalPath: false, daysBeforeEvent: 2 },
  { title: 'Set Up VIP Security Protocols', description: 'Establish dedicated security team for VIP and artist areas', priority: 'high', isCriticalPath: false, featureTypes: ['vip_area'], daysBeforeEvent: 1 },
  { title: 'Position Medical Escort Teams', description: 'Assign security for medical emergency extractions', priority: 'high', isCriticalPath: true, featureTypes: ['medical_tent', 'stage'], daysBeforeEvent: 1 },
  { title: 'Configure Radio Encryption', description: 'Set up encrypted radio channels for security communications', priority: 'high', isCriticalPath: false, daysBeforeEvent: 3 },
  { title: 'Establish Lost Child Protocol', description: 'Set up reunification area and procedures for separated minors', priority: 'high', isCriticalPath: true, featureTypes: ['security_post'], daysBeforeEvent: 1 },
  { title: 'Deploy Pit Security Teams', description: 'Position security in front of stage for crowd safety', priority: 'critical', isCriticalPath: true, featureTypes: ['stage'], daysBeforeEvent: 1 },
  { title: 'Coordinate Police Liaison', description: 'Brief local law enforcement on event security plan', priority: 'high', isCriticalPath: false, daysBeforeEvent: 5 },
  { title: 'Test Emergency Lockdown Procedures', description: 'Run through venue lockdown drill with all security teams', priority: 'critical', isCriticalPath: true, featureTypes: ['gate', 'command_center'], daysBeforeEvent: 1 },
  { title: 'Install Bag Check Stations', description: 'Set up bag check lanes with proper search protocols', priority: 'high', isCriticalPath: true, featureTypes: ['gate'], daysBeforeEvent: 2 },
  { title: 'Configure Access Control Zones', description: 'Set up backstage, production, and restricted area checkpoints', priority: 'critical', isCriticalPath: true, featureTypes: ['production_office', 'stage'], daysBeforeEvent: 2 },
  { title: 'Brief Undercover Security Team', description: 'Deploy plainclothes security for crowd monitoring', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 1 },
  { title: 'Set Up Security Vehicle Patrols', description: 'Position golf carts and patrol vehicles at staging areas', priority: 'medium', isCriticalPath: false, featureTypes: ['road', 'parking_lot'], daysBeforeEvent: 1 },
  { title: 'Install Panic Buttons', description: 'Deploy emergency panic buttons at all security posts', priority: 'high', isCriticalPath: true, featureTypes: ['security_post', 'gate'], daysBeforeEvent: 2 },
  { title: 'Coordinate Fire Marshal Inspection', description: 'Prepare for and complete fire safety inspection', priority: 'critical', isCriticalPath: true, daysBeforeEvent: 1 },
  { title: 'Test Emergency Broadcast System', description: 'Verify security can trigger emergency PA announcements', priority: 'critical', isCriticalPath: true, featureTypes: ['command_center'], daysBeforeEvent: 1 },
  { title: 'Set Up Crowd Density Monitoring', description: 'Configure crowd counting systems at key choke points', priority: 'high', isCriticalPath: false, featureTypes: ['gate', 'pathway'], daysBeforeEvent: 2 },
  { title: 'Establish Ejection Protocols', description: 'Brief security on ejection procedures and documentation', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 2 },
  { title: 'Configure Night Vision Equipment', description: 'Deploy and test night vision for perimeter security', priority: 'medium', isCriticalPath: false, featureTypes: ['fence', 'boundary'], daysBeforeEvent: 2 },
  { title: 'Final Security Walk-Through', description: 'Complete security inspection of all posts and procedures', priority: 'critical', isCriticalPath: true, featureTypes: ['command_center'], daysBeforeEvent: 1 },
];

// WORKFORCE TASKS (20)
const workforceTasks: TaskTemplate[] = [
  { title: 'Complete Staff Credential Production', description: 'Print and laminate all staff credentials with correct access levels', priority: 'critical', isCriticalPath: true, daysBeforeEvent: 5 },
  { title: 'Finalize Volunteer Training Schedule', description: 'Coordinate volunteer orientation sessions and assignments', priority: 'high', isCriticalPath: true, daysBeforeEvent: 7 },
  { title: 'Set Up Staff Check-In Station', description: 'Configure credential pickup and shift check-in area', priority: 'high', isCriticalPath: true, featureTypes: ['gate', 'production_office'], daysBeforeEvent: 2 },
  { title: 'Distribute Staff Uniforms', description: 'Organize and distribute uniforms/wristbands to all departments', priority: 'medium', isCriticalPath: false, featureTypes: ['warehouse'], daysBeforeEvent: 3 },
  { title: 'Configure Staff Meal Distribution', description: 'Set up catering stations and meal voucher system for staff', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 2 },
  { title: 'Brief Department Supervisors', description: 'Hold supervisor meeting on event protocols and escalation', priority: 'high', isCriticalPath: true, daysBeforeEvent: 2 },
  { title: 'Finalize Shift Schedules', description: 'Complete and distribute shift schedules for all staff', priority: 'critical', isCriticalPath: true, daysBeforeEvent: 3 },
  { title: 'Set Up Break Room Facilities', description: 'Prepare staff break areas with seating and refreshments', priority: 'low', isCriticalPath: false, daysBeforeEvent: 1 },
  { title: 'Configure Time Tracking System', description: 'Set up digital time clock for hourly staff check-in', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 2 },
  { title: 'Coordinate Transportation for Staff', description: 'Arrange shuttle service for staff from parking to venue', priority: 'medium', isCriticalPath: false, featureTypes: ['parking_lot'], daysBeforeEvent: 2 },
  { title: 'Complete Background Checks', description: 'Verify all required background checks are processed', priority: 'critical', isCriticalPath: true, daysBeforeEvent: 10 },
  { title: 'Train Medical Response Volunteers', description: 'Brief volunteers on basic first aid and emergency protocols', priority: 'high', isCriticalPath: true, featureTypes: ['medical_tent'], daysBeforeEvent: 3 },
  { title: 'Assign Radio Call Signs', description: 'Distribute radio assignments and call sign list to all leads', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 2 },
  { title: 'Set Up On-Site HR Station', description: 'Prepare area for staff issues and incident documentation', priority: 'low', isCriticalPath: false, featureTypes: ['production_office'], daysBeforeEvent: 1 },
  { title: 'Distribute Emergency Contact Cards', description: 'Ensure all staff have emergency contact information', priority: 'high', isCriticalPath: true, daysBeforeEvent: 1 },
  { title: 'Coordinate Overnight Security Staff', description: 'Arrange lodging and transportation for overnight shifts', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 3 },
  { title: 'Brief Guest Services Team', description: 'Train information booth staff on FAQ and venue layout', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 2 },
  { title: 'Set Up Volunteer Recognition Program', description: 'Prepare appreciation gifts and recognition ceremony', priority: 'low', isCriticalPath: false, daysBeforeEvent: 1 },
  { title: 'Configure Staff Communication App', description: 'Set up and test mobile app for staff announcements', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 4 },
  { title: 'Final Staffing Walk-Through', description: 'Verify all positions are filled and backups identified', priority: 'critical', isCriticalPath: true, daysBeforeEvent: 1 },
];

// VENDORS TASKS (20)
const vendorsTasks: TaskTemplate[] = [
  { title: 'Complete Vendor Credentialing', description: 'Process all vendor credentials and vehicle passes', priority: 'high', isCriticalPath: true, featureTypes: ['gate'], daysBeforeEvent: 5 },
  { title: 'Assign Vendor Booth Locations', description: 'Finalize vendor placement map and distribute assignments', priority: 'critical', isCriticalPath: true, featureTypes: ['vendor_booth'], daysBeforeEvent: 7 },
  { title: 'Verify Food Safety Certifications', description: 'Confirm all food vendors have valid health permits', priority: 'critical', isCriticalPath: true, daysBeforeEvent: 5 },
  { title: 'Coordinate Vendor Load-In Schedule', description: 'Create time slots for vendor setup and vehicle access', priority: 'high', isCriticalPath: true, featureTypes: ['vendor_booth', 'road'], daysBeforeEvent: 4 },
  { title: 'Install Vendor Power Distribution', description: 'Connect electrical service to all vendor locations', priority: 'critical', isCriticalPath: true, featureTypes: ['vendor_booth', 'generator'], daysBeforeEvent: 3 },
  { title: 'Set Up POS Systems', description: 'Install and test point-of-sale systems for all vendors', priority: 'high', isCriticalPath: true, featureTypes: ['vendor_booth'], daysBeforeEvent: 2 },
  { title: 'Verify Vendor Insurance Certificates', description: 'Confirm all vendor liability insurance is current', priority: 'high', isCriticalPath: true, daysBeforeEvent: 10 },
  { title: 'Coordinate Water/Waste Service', description: 'Set up greywater disposal for food vendors', priority: 'high', isCriticalPath: false, featureTypes: ['vendor_booth'], daysBeforeEvent: 2 },
  { title: 'Brief Vendors on Emergency Procedures', description: 'Distribute emergency protocols to all vendor staff', priority: 'high', isCriticalPath: true, featureTypes: ['vendor_booth'], daysBeforeEvent: 2 },
  { title: 'Inspect Food Vendor Equipment', description: 'Complete health and safety inspection of all food prep areas', priority: 'critical', isCriticalPath: true, featureTypes: ['vendor_booth'], daysBeforeEvent: 1 },
  { title: 'Set Up Merchandise Tents', description: 'Install official merchandise locations with inventory', priority: 'medium', isCriticalPath: false, featureTypes: ['vendor_booth'], daysBeforeEvent: 2 },
  { title: 'Configure Vendor WiFi Network', description: 'Set up dedicated network for vendor POS systems', priority: 'high', isCriticalPath: false, featureTypes: ['vendor_booth'], daysBeforeEvent: 3 },
  { title: 'Distribute Vendor Price Caps', description: 'Ensure all vendors have approved pricing posted', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 2 },
  { title: 'Coordinate Ice and Refrigeration', description: 'Arrange ice delivery and verify refrigeration units', priority: 'high', isCriticalPath: false, featureTypes: ['vendor_booth'], daysBeforeEvent: 2 },
  { title: 'Set Up Vendor Check-In Station', description: 'Create vendor registration and credential pickup area', priority: 'medium', isCriticalPath: false, featureTypes: ['gate'], daysBeforeEvent: 2 },
  { title: 'Install Cash Handling Security', description: 'Set up secure cash collection and storage system', priority: 'high', isCriticalPath: false, daysBeforeEvent: 1 },
  { title: 'Verify Allergen Labeling', description: 'Confirm all food vendors have proper allergen signage', priority: 'high', isCriticalPath: false, featureTypes: ['vendor_booth'], daysBeforeEvent: 1 },
  { title: 'Coordinate Vendor Parking', description: 'Assign vendor vehicle parking and unloading zones', priority: 'medium', isCriticalPath: false, featureTypes: ['parking_lot', 'road'], daysBeforeEvent: 3 },
  { title: 'Set Up Vendor Support Hotline', description: 'Establish communication channel for vendor issues', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 2 },
  { title: 'Final Vendor Walk-Through', description: 'Complete inspection of all vendor setups before doors', priority: 'critical', isCriticalPath: true, featureTypes: ['vendor_booth'], daysBeforeEvent: 1 },
];

// MARKETING TASKS (15)
const marketingTasks: TaskTemplate[] = [
  { title: 'Install Event Branding at Gates', description: 'Mount welcome arches and branded signage at all entry points', priority: 'high', isCriticalPath: false, featureTypes: ['gate'], daysBeforeEvent: 2 },
  { title: 'Set Up Photo Opportunity Locations', description: 'Install branded photo backdrops and selfie stations', priority: 'medium', isCriticalPath: false, featureTypes: ['art_installation'], daysBeforeEvent: 2 },
  { title: 'Coordinate Media Credentials', description: 'Process and distribute media passes and photo pit access', priority: 'high', isCriticalPath: false, daysBeforeEvent: 3 },
  { title: 'Install Sponsor Activation Areas', description: 'Build out sponsor experience zones per contract specs', priority: 'high', isCriticalPath: false, featureTypes: ['vendor_booth', 'zone'], daysBeforeEvent: 3 },
  { title: 'Brief Social Media Team', description: 'Coordinate real-time social media coverage plan', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 2 },
  { title: 'Set Up VIP Experience Elements', description: 'Install premium experience features in VIP areas', priority: 'medium', isCriticalPath: false, featureTypes: ['vip_area'], daysBeforeEvent: 2 },
  { title: 'Coordinate Photographer Positions', description: 'Assign official photographers to stages and key areas', priority: 'medium', isCriticalPath: false, featureTypes: ['stage'], daysBeforeEvent: 1 },
  { title: 'Install Digital Signage Network', description: 'Deploy LED screens with event information and sponsors', priority: 'medium', isCriticalPath: false, featureTypes: ['stage', 'gate'], daysBeforeEvent: 3 },
  { title: 'Prepare Press Kit Distribution', description: 'Organize media check-in and press kit pickup area', priority: 'low', isCriticalPath: false, daysBeforeEvent: 1 },
  { title: 'Coordinate Influencer Experiences', description: 'Set up exclusive areas and experiences for influencer access', priority: 'low', isCriticalPath: false, featureTypes: ['vip_area'], daysBeforeEvent: 2 },
  { title: 'Install Interactive Brand Experiences', description: 'Set up branded games, activations, and giveaways', priority: 'medium', isCriticalPath: false, featureTypes: ['vendor_booth'], daysBeforeEvent: 2 },
  { title: 'Brief Guest Services on Promos', description: 'Train info booth on current promotions and hashtags', priority: 'low', isCriticalPath: false, daysBeforeEvent: 1 },
  { title: 'Set Up Artist Meet & Greet Areas', description: 'Prepare meet and greet locations with photo backdrop', priority: 'medium', isCriticalPath: false, featureTypes: ['production_office'], daysBeforeEvent: 1 },
  { title: 'Coordinate Event App Push Notifications', description: 'Schedule promotional push notifications for app users', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 1 },
  { title: 'Final Branding Walk-Through', description: 'Verify all sponsor and event branding is properly displayed', priority: 'high', isCriticalPath: false, featureTypes: ['gate', 'stage'], daysBeforeEvent: 1 },
];

// FINANCE TASKS (15)
const financeTasks: TaskTemplate[] = [
  { title: 'Set Up On-Site Cash Office', description: 'Establish secure cash counting and storage facility', priority: 'critical', isCriticalPath: true, featureTypes: ['command_center', 'production_office'], daysBeforeEvent: 2 },
  { title: 'Distribute Petty Cash Funds', description: 'Provide emergency cash to department heads', priority: 'high', isCriticalPath: false, daysBeforeEvent: 1 },
  { title: 'Verify Vendor Payment Terms', description: 'Confirm payment schedules and outstanding balances', priority: 'high', isCriticalPath: false, daysBeforeEvent: 5 },
  { title: 'Set Up Box Office Systems', description: 'Install and test ticket sales and will-call systems', priority: 'critical', isCriticalPath: true, featureTypes: ['gate'], daysBeforeEvent: 2 },
  { title: 'Configure Revenue Tracking Dashboard', description: 'Set up real-time sales monitoring for all revenue streams', priority: 'high', isCriticalPath: false, daysBeforeEvent: 2 },
  { title: 'Brief Cash Handling Teams', description: 'Train staff on cash handling procedures and security', priority: 'high', isCriticalPath: true, daysBeforeEvent: 2 },
  { title: 'Verify Insurance Coverage', description: 'Confirm all event insurance policies are in effect', priority: 'critical', isCriticalPath: true, daysBeforeEvent: 7 },
  { title: 'Set Up Refund Processing Station', description: 'Establish location for ticket refunds and exchanges', priority: 'medium', isCriticalPath: false, featureTypes: ['gate'], daysBeforeEvent: 1 },
  { title: 'Coordinate ATM Placement', description: 'Verify ATM locations are operational with cash', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 1 },
  { title: 'Process Final Vendor Payments', description: 'Issue remaining payments due before event start', priority: 'high', isCriticalPath: false, daysBeforeEvent: 3 },
  { title: 'Set Up Expense Tracking System', description: 'Configure system for tracking on-site expenditures', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 3 },
  { title: 'Brief Accounting Team on Procedures', description: 'Review settlement and reconciliation procedures', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 2 },
  { title: 'Verify Tax Collection Compliance', description: 'Confirm all vendors are collecting applicable taxes', priority: 'high', isCriticalPath: false, daysBeforeEvent: 3 },
  { title: 'Prepare End-of-Day Settlement Forms', description: 'Print and distribute cash settlement documentation', priority: 'medium', isCriticalPath: false, daysBeforeEvent: 1 },
  { title: 'Final Financial Walk-Through', description: 'Verify all financial systems and cash handling in place', priority: 'critical', isCriticalPath: true, featureTypes: ['command_center'], daysBeforeEvent: 1 },
];

// Helper function to get random status with weighted distribution
function getRandomStatus(): string {
  const rand = Math.random();
  if (rand < 0.25) return 'pending';
  if (rand < 0.55) return 'in_progress';
  if (rand < 0.85) return 'completed';
  return 'blocked';
}

// Helper function to calculate completion based on status
function getCompletionPercent(status: string): number {
  switch (status) {
    case 'pending': return Math.floor(Math.random() * 10);
    case 'in_progress': return Math.floor(Math.random() * 60) + 20;
    case 'completed': return 100;
    case 'blocked': return Math.floor(Math.random() * 40) + 10;
    default: return 0;
  }
}

async function main() {
  console.log('🎪 Seeding Event Management Tasks...\n');

  try {
    // Get existing event
    const existingEvent = await db
      .select()
      .from(events)
      .where(eq(events.slug, 'test-event-001'))
      .limit(1);

    if (existingEvent.length === 0) {
      console.error('❌ Error: Test event not found. Run db:seed first.');
      process.exit(1);
    }

    const eventId = existingEvent[0].id;
    const eventStartDate = existingEvent[0].startDate;
    console.log(`✓ Found event: ${existingEvent[0].name} (ID: ${eventId})`);
    console.log(`  Start Date: ${eventStartDate.toISOString()}\n`);

    // Get all venue features to link tasks (use raw SQL to avoid geometry parsing issues)
    const featuresResult = await db.execute(sql`
      SELECT id, feature_type, name FROM venue_features WHERE event_id = ${eventId}
    `) as unknown as { id: string; feature_type: string; name: string }[];
    const features = featuresResult;
    console.log(`✓ Found ${features.length} venue features to link tasks\n`);

    // Create feature type lookup map
    const featuresByType: Record<string, any[]> = {};
    features.forEach(f => {
      if (!featuresByType[f.feature_type]) {
        featuresByType[f.feature_type] = [];
      }
      featuresByType[f.feature_type].push(f);
    });

    // Helper to find matching feature for a task
    const findMatchingFeature = (featureTypes?: string[]): string | null => {
      if (!featureTypes || featureTypes.length === 0) return null;
      for (const type of featureTypes) {
        if (featuresByType[type] && featuresByType[type].length > 0) {
          // Return random feature of this type
          const matchingFeatures = featuresByType[type];
          return matchingFeatures[Math.floor(Math.random() * matchingFeatures.length)].id;
        }
      }
      return null;
    };

    // Delete existing tasks for this event
    console.log('🗑️  Clearing existing tasks...');
    await db.delete(tasks).where(eq(tasks.eventId, eventId));
    await db.delete(activityFeed).where(eq(activityFeed.eventId, eventId));

    // Task data by workcenter
    const tasksByWorkcenter: Record<string, TaskTemplate[]> = {
      operations: operationsTasks,
      production: productionTasks,
      security: securityTasks,
      workforce: workforceTasks,
      vendors: vendorsTasks,
      marketing: marketingTasks,
      finance: financeTasks,
    };

    let totalTasks = 0;
    const activityEntries: any[] = [];

    // Insert tasks for each workcenter
    for (const [workcenter, templates] of Object.entries(tasksByWorkcenter)) {
      console.log(`\n📋 Creating ${templates.length} ${workcenter.toUpperCase()} tasks...`);
      
      for (const template of templates) {
        const status = getRandomStatus();
        const completionPercent = getCompletionPercent(status);
        const venueFeatureId = findMatchingFeature(template.featureTypes);
        
        // Calculate due date based on days before event
        const dueDate = new Date(eventStartDate);
        dueDate.setDate(dueDate.getDate() - template.daysBeforeEvent);

        const [newTask] = await db.insert(tasks).values({
          eventId,
          venueFeatureId,
          workcenter,
          title: template.title,
          description: template.description,
          status,
          priority: template.priority,
          isCriticalPath: template.isCriticalPath,
          dueDate,
          completionPercent: completionPercent.toString(),
          completedAt: status === 'completed' ? new Date() : null,
          blockedReason: status === 'blocked' ? 'Awaiting resource allocation' : null,
        }).returning();

        totalTasks++;

        // Create activity feed entry for some tasks
        if (Math.random() > 0.5) {
          const activityType = status === 'completed' ? 'task_completed' 
            : status === 'in_progress' ? 'task_started' 
            : status === 'blocked' ? 'task_blocked' 
            : 'task_created';
          
          activityEntries.push({
            eventId,
            activityType,
            entityType: 'task',
            entityId: newTask.id,
            message: `${template.title} - ${status.replace('_', ' ')}`,
            workcenter,
            metadata: { 
              priority: template.priority, 
              isCriticalPath: template.isCriticalPath,
              taskTitle: template.title
            },
            createdAt: new Date(Date.now() - Math.random() * 86400000 * 3), // Random time in last 3 days
          });
        }

        // Show linked feature
        if (venueFeatureId) {
          const linkedFeature = features.find(f => f.id === venueFeatureId);
          console.log(`   ✓ "${template.title}" → ${linkedFeature?.name || 'Unknown'}`);
        }
      }
    }

    // Insert activity feed entries
    console.log(`\n📰 Creating ${activityEntries.length} activity feed entries...`);
    if (activityEntries.length > 0) {
      await db.insert(activityFeed).values(activityEntries);
    }

    // Update venue feature completion percentages based on linked tasks
    console.log('\n🔄 Updating venue feature completion percentages...');
    for (const feature of features) {
      const linkedTasks = await db.select().from(tasks).where(eq(tasks.venueFeatureId, feature.id));
      if (linkedTasks.length > 0) {
        const avgCompletion = linkedTasks.reduce((sum, t) => sum + parseFloat(t.completionPercent), 0) / linkedTasks.length;
        const newStatus = avgCompletion === 100 ? 'completed' 
          : avgCompletion > 0 ? 'in_progress' 
          : 'pending';
        
        await db.execute(sql`
          UPDATE venue_features 
          SET completion_percent = ${avgCompletion.toFixed(2)}, 
              status = ${newStatus}, 
              updated_at = NOW() 
          WHERE id = ${feature.id}
        `);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ TASK SEEDING COMPLETE');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   Total Tasks Created: ${totalTasks}`);
    console.log(`   Activity Feed Entries: ${activityEntries.length}`);
    console.log(`   Venue Features Updated: ${features.length}`);
    console.log(`\n📋 Tasks by Department:`);
    for (const [wc, templates] of Object.entries(tasksByWorkcenter)) {
      console.log(`   • ${wc.charAt(0).toUpperCase() + wc.slice(1)}: ${templates.length} tasks`);
    }
    console.log('\n🌐 View tasks on 3D map: https://dev.web.opraxius.com/map-demo');
    console.log('📊 View dashboard: https://dev.web.opraxius.com/dashboard\n');

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

