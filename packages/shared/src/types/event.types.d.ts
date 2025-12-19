import type { GeoJSONGeometry } from './venue.types';
export type EventType = 'edc_las_vegas' | 'edc_orlando' | 'edc_mexico' | 'beyond_wonderland' | 'nocturnal_wonderland';
export type EventStatus = 'planning' | 'setup' | 'live' | 'teardown' | 'completed' | 'cancelled';
export interface Event {
    id: string;
    name: string;
    slug: string;
    eventType: EventType;
    startDate: Date;
    endDate: Date;
    status: EventStatus;
    venueBounds?: GeoJSONGeometry;
    createdAt: Date;
    updatedAt: Date;
}
export interface EventSummary extends Event {
    totalTasks: number;
    completedTasks: number;
    completionPercent: number;
    criticalTasksCount: number;
    blockedTasksCount: number;
    overdueTasksCount: number;
}
//# sourceMappingURL=event.types.d.ts.map