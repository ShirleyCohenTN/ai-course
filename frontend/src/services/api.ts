import axios from 'axios';
import { config } from '../config';
import type { Task } from '../types';

const axiosInstance = axios.create({
    baseURL: config.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    baseUrl: config.API_URL,

    getTasks: async (): Promise<Task[]> => {
        const response = await axiosInstance.get<Task[]>('/api/tasks');
        return response.data;
    },

    createTask: async (title: string): Promise<Task> => {
        const response = await axiosInstance.post<Task>('/api/tasks', { title });
        return response.data;
    },

    updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
        const response = await axiosInstance.patch<Task>(`/api/tasks/${id}`, updates);
        return response.data;
    }
};
