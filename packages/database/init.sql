-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  event_type VARCHAR(50) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'planning',
  venue_bounds GEOMETRY(Polygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_venue_bounds_gist ON events USING GIST(venue_bounds);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  role VARCHAR(50) NOT NULL,
  workcenters VARCHAR(100)[] NOT NULL DEFAULT '{}',
  permissions JSONB NOT NULL DEFAULT '{}',
  auth0_user_id VARCHAR(255) UNIQUE,
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth0 ON users(auth0_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_workcenters ON users USING GIN(workcenters);

-- Create venue_features table
CREATE TABLE IF NOT EXISTS venue_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  feature_type VARCHAR(50) NOT NULL,
  feature_category VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  geometry GEOMETRY(Geometry, 4326) NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  workcenter_access VARCHAR(100)[] NOT NULL DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  completion_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_venue_features_event ON venue_features(event_id);
CREATE INDEX IF NOT EXISTS idx_venue_features_type ON venue_features(feature_type);
CREATE INDEX IF NOT EXISTS idx_venue_features_category ON venue_features(feature_category);
CREATE INDEX IF NOT EXISTS idx_venue_features_geometry_gist ON venue_features USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_venue_features_workcenter ON venue_features USING GIN(workcenter_access);
CREATE INDEX IF NOT EXISTS idx_venue_features_status ON venue_features(status);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  venue_feature_id UUID REFERENCES venue_features(id) ON DELETE SET NULL,
  workcenter VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  is_critical_path BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_to UUID REFERENCES users(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  blocked_reason TEXT,
  parent_task_id UUID REFERENCES tasks(id),
  dependencies UUID[] NOT NULL DEFAULT '{}',
  completion_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_event ON tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_feature ON tasks(venue_feature_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workcenter ON tasks(workcenter);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_critical ON tasks(is_critical_path) WHERE is_critical_path = TRUE;
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_dependencies ON tasks USING GIN(dependencies);

-- Create workcenters table
CREATE TABLE IF NOT EXISTS workcenters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(7),
  total_tasks_count INTEGER NOT NULL DEFAULT 0,
  completed_tasks_count INTEGER NOT NULL DEFAULT 0,
  completion_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'on_track',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workcenters_event ON workcenters(event_id);
CREATE INDEX IF NOT EXISTS idx_workcenters_name ON workcenters(name);

-- Create activity_feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  activity_type VARCHAR(50) NOT NULL,
  workcenter VARCHAR(50),
  entity_type VARCHAR(50),
  entity_id UUID,
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_event ON activity_feed(event_id);
CREATE INDEX IF NOT EXISTS idx_activity_workcenter ON activity_feed(workcenter);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_feed(activity_type);

-- Create ai_chat_history table
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  context_used JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_user ON ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_session ON ai_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON ai_chat_history(created_at DESC);
