import { useMemo } from 'react';
import type { Task, TaskFilter, SortOption } from '../types';

export const useFilteredAndSortedTasks = (
    tasks: Task[],
    filter: TaskFilter,
    sortOption: SortOption
) => {
    const filteredAndSortedTasks = useMemo(() => {
        // First, apply filter
        let filtered = tasks;
        if (filter === 'active') {
            filtered = tasks.filter(task => !task.isCompleted);
        } else if (filter === 'completed') {
            filtered = tasks.filter(task => task.isCompleted);
        }

        // Then, apply sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (sortOption) {
                case 'date-asc':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'date-desc':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });

        return sorted;
    }, [tasks, filter, sortOption]);

    return filteredAndSortedTasks;
};
