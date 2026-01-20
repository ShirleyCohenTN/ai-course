import { useState } from 'react';
import { TaskList } from '../components/TaskList';
import { TaskInput } from '../components/TaskInput';
import { FilterControls } from '../components/FilterControls';
import { SortControls } from '../components/SortControls';
import { useTasks } from '../hooks/useTasks';
import { useFilteredAndSortedTasks } from '../hooks/useFilteredAndSortedTasks';
import type { TaskFilter, SortOption } from '../types';

export const TasksPage = () => {
    const [filter, setFilter] = useState<TaskFilter>('all');
    const [sortOption, setSortOption] = useState<SortOption>('date-desc');
    
    const { 
        tasks, 
        loading, 
        error, 
        handleAddTask, 
        handleToggleTask 
    } = useTasks();

    const filteredAndSortedTasks = useFilteredAndSortedTasks(tasks, filter, sortOption);

    return (
        <div className="tasks-page">
            <header className="page-header">
                <h1>Simple Task Manager</h1>
                <p>Simple task management for your day.</p>
            </header>
            
            <section className="input-section">
                <TaskInput onAddTask={handleAddTask} />
            </section>

            <section className="controls-section">
                <FilterControls filter={filter} onFilterChange={setFilter} />
                <SortControls sortOption={sortOption} onSortChange={setSortOption} />
            </section>

            <section className="list-section">
                {error && <div className="error-message">{error}</div>}
                {loading ? (
                    <div className="loading-state">Loading tasks...</div>
                ) : (
                    <TaskList tasks={filteredAndSortedTasks} onToggleTask={handleToggleTask} />
                )}
            </section>
        </div>
    );
};
