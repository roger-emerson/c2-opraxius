import type { VenueFeatureCategory } from './venue.types';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export interface Task {
    id: string;
    eventId: string;
    venueFeatureId?: string;
    workcenter: VenueFeatureCategory;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    isCriticalPath: boolean;
    assignedTo?: string;
    dueDate?: Date;
    completedAt?: Date;
    blockedReason?: string;
    parentTaskId?: string;
    dependencies: string[];
    completionPercent: number;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
}
export interface TaskWithVenue extends Task {
    venuFeatureName?: string;
    venueFeatureCode?: string;
}
//# sourceMappingURL=task.types.d.ts.map