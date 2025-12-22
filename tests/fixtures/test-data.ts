/**
 * Opraxius C2 - Test Fixtures
 * 
 * Provides consistent test data for all test suites
 */

// ============================================================
// EVENTS
// ============================================================

export const testEvents = {
  edcVegas: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'EDC Las Vegas 2025',
    slug: 'edc-vegas-2025',
    startDate: new Date('2025-05-16'),
    endDate: new Date('2025-05-18'),
    venue: 'Las Vegas Motor Speedway',
    timezone: 'America/Los_Angeles',
    status: 'active' as const,
    // PostGIS boundary (simplified polygon)
    boundary: {
      type: 'Polygon' as const,
      coordinates: [[
        [-115.0, 36.27],
        [-115.0, 36.28],
        [-114.99, 36.28],
        [-114.99, 36.27],
        [-115.0, 36.27],
      ]],
    },
  },
  edcOrlando: {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'EDC Orlando 2025',
    slug: 'edc-orlando-2025',
    startDate: new Date('2025-11-07'),
    endDate: new Date('2025-11-09'),
    venue: 'Tinker Field',
    timezone: 'America/New_York',
    status: 'planning' as const,
    boundary: {
      type: 'Polygon' as const,
      coordinates: [[
        [-81.39, 28.54],
        [-81.39, 28.55],
        [-81.38, 28.55],
        [-81.38, 28.54],
        [-81.39, 28.54],
      ]],
    },
  },
};

// ============================================================
// USERS (One per role)
// ============================================================

export const testUsers = {
  admin: {
    id: '550e8400-e29b-41d4-a716-446655440010',
    email: 'admin@esg.test',
    name: 'Test Admin',
    auth0Id: 'auth0|admin123',
    roles: ['admin'],
    workcenters: ['operations', 'production', 'security', 'workforce', 'vendors', 'sponsors', 'marketing', 'finance'],
    permissions: { '*': ['create', 'read', 'update', 'delete'] },
  },
  operationsLead: {
    id: '550e8400-e29b-41d4-a716-446655440011',
    email: 'ops@esg.test',
    name: 'Operations Lead',
    auth0Id: 'auth0|ops123',
    roles: ['operations_lead'],
    workcenters: ['operations'],
    permissions: { 
      tasks: ['create', 'read', 'update', 'delete'],
      venue_features: ['create', 'read', 'update', 'delete'],
    },
  },
  productionLead: {
    id: '550e8400-e29b-41d4-a716-446655440012',
    email: 'prod@esg.test',
    name: 'Production Lead',
    auth0Id: 'auth0|prod123',
    roles: ['production_lead'],
    workcenters: ['production'],
    permissions: {
      tasks: ['create', 'read', 'update', 'delete'],
      venue_features: ['create', 'read', 'update', 'delete'],
    },
  },
  securityLead: {
    id: '550e8400-e29b-41d4-a716-446655440013',
    email: 'security@esg.test',
    name: 'Security Lead',
    auth0Id: 'auth0|sec123',
    roles: ['security_lead'],
    workcenters: ['security'],
    permissions: {
      tasks: ['create', 'read', 'update', 'delete'],
      venue_features: ['create', 'read', 'update', 'delete'],
    },
  },
  workforceLead: {
    id: '550e8400-e29b-41d4-a716-446655440014',
    email: 'workforce@esg.test',
    name: 'Workforce Lead',
    auth0Id: 'auth0|wf123',
    roles: ['workforce_lead'],
    workcenters: ['workforce'],
    permissions: {
      tasks: ['create', 'read', 'update', 'delete'],
      venue_features: ['read'],
    },
  },
  vendorLead: {
    id: '550e8400-e29b-41d4-a716-446655440015',
    email: 'vendor@esg.test',
    name: 'Vendor Lead',
    auth0Id: 'auth0|vendor123',
    roles: ['vendor_lead'],
    workcenters: ['vendors'],
    permissions: {
      tasks: ['create', 'read', 'update', 'delete'],
      venue_features: ['read'],
    },
  },
  viewer: {
    id: '550e8400-e29b-41d4-a716-446655440020',
    email: 'viewer@esg.test',
    name: 'Test Viewer',
    auth0Id: 'auth0|viewer123',
    roles: ['viewer'],
    workcenters: [],
    permissions: {
      tasks: ['read'],
      venue_features: ['read'],
      events: ['read'],
    },
  },
};

// ============================================================
// WORKCENTERS
// ============================================================

export const testWorkcenters = [
  { id: 'operations', name: 'Operations', completion: 45 },
  { id: 'production', name: 'Production', completion: 62 },
  { id: 'security', name: 'Security', completion: 30 },
  { id: 'workforce', name: 'Workforce', completion: 55 },
  { id: 'vendors', name: 'Vendors', completion: 40 },
  { id: 'sponsors', name: 'Sponsors', completion: 75 },
  { id: 'marketing', name: 'Marketing', completion: 80 },
  { id: 'finance', name: 'Finance', completion: 90 },
];

// ============================================================
// VENUE FEATURES
// ============================================================

export const testVenueFeatures = {
  mainStage: {
    id: '550e8400-e29b-41d4-a716-446655440100',
    eventId: testEvents.edcVegas.id,
    name: 'kineticFIELD',
    featureType: 'stage' as const,
    workcenter: 'production',
    geometry: {
      type: 'Point' as const,
      coordinates: [-115.005, 36.275],
    },
    properties: {
      capacity: 80000,
      headliner: true,
    },
  },
  mainGate: {
    id: '550e8400-e29b-41d4-a716-446655440101',
    eventId: testEvents.edcVegas.id,
    name: 'Main Entrance',
    featureType: 'gate' as const,
    workcenter: 'operations',
    geometry: {
      type: 'Point' as const,
      coordinates: [-115.002, 36.270],
    },
    properties: {
      entryPoint: true,
      securityLevel: 'high',
    },
  },
  vendorArea: {
    id: '550e8400-e29b-41d4-a716-446655440102',
    eventId: testEvents.edcVegas.id,
    name: 'Food Court A',
    featureType: 'vendor_booth' as const,
    workcenter: 'vendors',
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[
        [-115.003, 36.273],
        [-115.003, 36.274],
        [-115.002, 36.274],
        [-115.002, 36.273],
        [-115.003, 36.273],
      ]],
    },
    properties: {
      vendorCount: 12,
      foodType: 'mixed',
    },
  },
  securityPerimeter: {
    id: '550e8400-e29b-41d4-a716-446655440103',
    eventId: testEvents.edcVegas.id,
    name: 'North Perimeter',
    featureType: 'security_zone' as const,
    workcenter: 'security',
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [-115.01, 36.28],
        [-114.99, 36.28],
      ],
    },
    properties: {
      patrolRoute: true,
      checkpoints: 4,
    },
  },
};

// ============================================================
// TASKS
// ============================================================

export const testTasks = {
  opsTask: {
    id: '550e8400-e29b-41d4-a716-446655440200',
    eventId: testEvents.edcVegas.id,
    title: 'Coordinate gate opening sequence',
    description: 'Ensure all gates open simultaneously at 5pm',
    workcenter: 'operations',
    status: 'in_progress' as const,
    priority: 'high' as const,
    assigneeId: testUsers.operationsLead.id,
    dueDate: new Date('2025-05-16T17:00:00'),
    dependencies: [],
    criticalPath: true,
  },
  prodTask: {
    id: '550e8400-e29b-41d4-a716-446655440201',
    eventId: testEvents.edcVegas.id,
    title: 'Sound check kineticFIELD',
    description: 'Complete sound check for main stage',
    workcenter: 'production',
    status: 'pending' as const,
    priority: 'critical' as const,
    assigneeId: testUsers.productionLead.id,
    dueDate: new Date('2025-05-16T14:00:00'),
    dependencies: [],
    criticalPath: true,
  },
  securityTask: {
    id: '550e8400-e29b-41d4-a716-446655440202',
    eventId: testEvents.edcVegas.id,
    title: 'Perimeter sweep',
    description: 'Complete perimeter security sweep before gates open',
    workcenter: 'security',
    status: 'pending' as const,
    priority: 'high' as const,
    assigneeId: testUsers.securityLead.id,
    dueDate: new Date('2025-05-16T16:00:00'),
    dependencies: [],
    criticalPath: false,
  },
  vendorTask: {
    id: '550e8400-e29b-41d4-a716-446655440203',
    eventId: testEvents.edcVegas.id,
    title: 'Vendor setup verification',
    description: 'Verify all food vendors are set up and health inspected',
    workcenter: 'vendors',
    status: 'in_progress' as const,
    priority: 'medium' as const,
    assigneeId: testUsers.vendorLead.id,
    dueDate: new Date('2025-05-16T15:00:00'),
    dependencies: [],
    criticalPath: false,
  },
};

// ============================================================
// JWT TOKENS (for testing auth)
// ============================================================

export const testTokenPayloads = {
  admin: {
    sub: testUsers.admin.auth0Id,
    email: testUsers.admin.email,
    name: testUsers.admin.name,
    roles: testUsers.admin.roles,
    workcenters: testUsers.admin.workcenters,
  },
  operationsLead: {
    sub: testUsers.operationsLead.auth0Id,
    email: testUsers.operationsLead.email,
    name: testUsers.operationsLead.name,
    roles: testUsers.operationsLead.roles,
    workcenters: testUsers.operationsLead.workcenters,
  },
  viewer: {
    sub: testUsers.viewer.auth0Id,
    email: testUsers.viewer.email,
    name: testUsers.viewer.name,
    roles: testUsers.viewer.roles,
    workcenters: testUsers.viewer.workcenters,
  },
};

// ============================================================
// HELPERS
// ============================================================

/**
 * Get all users as an array
 */
export function getAllTestUsers() {
  return Object.values(testUsers);
}

/**
 * Get all tasks as an array
 */
export function getAllTestTasks() {
  return Object.values(testTasks);
}

/**
 * Get tasks for a specific workcenter
 */
export function getTasksByWorkcenter(workcenter: string) {
  return Object.values(testTasks).filter(t => t.workcenter === workcenter);
}

/**
 * Get venue features for a specific workcenter
 */
export function getVenueFeaturesByWorkcenter(workcenter: string) {
  return Object.values(testVenueFeatures).filter(f => f.workcenter === workcenter);
}

