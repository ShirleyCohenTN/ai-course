import React from 'react';
import type { TaskFilter } from '../types';

interface FilterControlsProps {
    filter: TaskFilter;
    onFilterChange: (filter: TaskFilter) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({ filter, onFilterChange }) => {
    return (
        <div className="filter-controls" data-testid="filter-controls">
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => onFilterChange('all')}
                    data-testid="filter-all"
                >
                    All
                </button>
                <button
                    className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => onFilterChange('active')}
                    data-testid="filter-active"
                >
                    Active
                </button>
                <button
                    className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => onFilterChange('completed')}
                    data-testid="filter-completed"
                >
                    Completed
                </button>
            </div>
        </div>
    );
};
