import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { logger } from '../utils/logger';
import type { Task } from '../types';

const TASKS_QUERY_KEY = ['tasks'] as const;

export const useTasks = () => {
    const queryClient = useQueryClient();

    // Fetch tasks using React Query
    const {
        data: tasks = [],
        isLoading: loading,
        error: queryError,
    } = useQuery<Task[]>({
        queryKey: TASKS_QUERY_KEY,
        queryFn: async () => {
            const data = await api.getTasks();
            logger.info('Tasks loaded successfully', data.length);
            return data;
        },
    });

    // Create task mutation with optimistic update
    const createTaskMutation = useMutation({
        mutationFn: async (title: string) => {
            const newTask = await api.createTask(title);
            logger.info('Task added successfully', newTask.id);
            return newTask;
        },
        onSuccess: () => {
            // Invalidate and refetch tasks after successful creation
            queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
        },
        onError: (err) => {
            const message = 'Failed to add task';
            logger.error(message, err);
            alert(message);
        },
    });

    // Update task mutation with optimistic update
    const updateTaskMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
            const updatedTask = await api.updateTask(id, updates);
            logger.info('Task updated successfully', id);
            return updatedTask;
        },
        onMutate: async ({ id, updates }) => {
            // Cancel outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

            // Optimistically update the cache
            if (previousTasks) {
                queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old) =>
                    old?.map((task) => (task.id === id ? { ...task, ...updates } : task)) ?? []
                );
            }

            // Return context with snapshot for rollback
            return { previousTasks };
        },
        onError: (err, variables, context) => {
            // Rollback to previous state on error
            if (context?.previousTasks) {
                queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
            }
            const message = 'Failed to update task';
            logger.error(message, err);
            alert(message);
        },
        onSettled: () => {
            // Always refetch after error or success to ensure consistency
            queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
        },
    });

    const handleAddTask = async (title: string) => {
        await createTaskMutation.mutateAsync(title);
    };

    const handleToggleTask = async (id: string, isCompleted: boolean) => {
        await updateTaskMutation.mutateAsync({ id, updates: { isCompleted } });
    };

    const refreshTasks = () => {
        queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    };

    // Convert query error to string for compatibility
    const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to load tasks') : null;

    return {
        tasks,
        loading,
        error,
        handleAddTask,
        handleToggleTask,
        refreshTasks,
    };
};
