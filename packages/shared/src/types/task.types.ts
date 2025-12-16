import type { VenueFeatureCategory } from './venue.types';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  eventId: string;
  venueFeatureId?: string;  // Optional link to venue feature
  workcenter: VenueFeatureCategory;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  isCriticalPath: boolean;
  assignedTo?: string;  // User ID
  dueDate?: Date;
  completedAt?: Date;
  blockedReason?: string;
  parentTaskId?: string;  // For sub-tasks
  dependencies: string[];  // Array of task IDs this depends on
  completionPercent: number;  // 0-100
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;  // User ID
}

export interface TaskWithVenue extends Task {
  venuFeatureName?: string;
  venueFeatureCode?: string;
}
