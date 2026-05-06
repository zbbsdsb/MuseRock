import React from 'react';
import { X, Filter } from 'lucide-react';
import type { ProjectFilters } from '../../types/project';

interface FilterChipsProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  onClearAll: () => void;
}

export default function FilterChips({
  filters,
  onFiltersChange,
  onClearAll,
}: FilterChipsProps) {
  const chips = [];

  // Status chip
  if (filters.status && filters.status !== 'all') {
    chips.push({
      id: 'status',
      label: `Status: ${filters.status}`,
      onRemove: () => onFiltersChange({ ...filters, status: 'all' }),
    });
  }

  // Favorites chip
  if (filters.favorites) {
    chips.push({
      id: 'favorites',
      label: 'Favorites Only',
      onRemove: () => onFiltersChange({ ...filters, favorites: false }),
    });
  }

  // Date range chip
  if (filters.dateRange) {
    const formatDate = (date: Date) => 
      new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    chips.push({
      id: 'dateRange',
      label: `${formatDate(filters.dateRange.start)} - ${formatDate(filters.dateRange.end)}`,
      onRemove: () => onFiltersChange({ ...filters, dateRange: undefined }),
    });
  }

  // Tags chips
  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach(tag => {
      chips.push({
        id: `tag-${tag}`,
        label: `#${tag}`,
        onRemove: () => onFiltersChange({
          ...filters,
          tags: filters.tags?.filter(t => t !== tag),
        }),
      });
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {chips.map(chip => (
        <div
          key={chip.id}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30"
        >
          <span className="text-xs font-medium text-violet-700">{chip.label}</span>
          <button
            onClick={chip.onRemove}
            className="p-0.5 rounded-full hover:bg-violet-500/20 text-violet-600 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      <button
        onClick={onClearAll}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-brand-black/50 hover:text-brand-black hover:bg-white transition-colors"
      >
        Clear All
        <X size={12} />
      </button>
    </div>
  );
}
