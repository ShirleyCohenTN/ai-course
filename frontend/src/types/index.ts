export interface Task {
    id: string;
    title: string;
    isCompleted: boolean;
    createdAt: string;
}

export type TaskFilter = 'all' | 'active' | 'completed';

export type SortOption = 'date-asc' | 'date-desc' | 'title-asc' | 'title-desc';
