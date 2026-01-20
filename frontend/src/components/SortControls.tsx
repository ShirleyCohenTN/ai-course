import React from 'react';
import type { SortOption } from '../types';

interface SortControlsProps {
    sortOption: SortOption;
    onSortChange: (sortOption: SortOption) => void;
}

export const SortControls: React.FC<SortControlsProps> = ({ sortOption, onSortChange }) => {
    return (
        <div className="sort-controls" data-testid="sort-controls">
            <label htmlFor="sort-select">Sort by:</label>
            <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="sort-select"
                data-testid="sort-select"
            >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
            </select>
        </div>
    );
};
