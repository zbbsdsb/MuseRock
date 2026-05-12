import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, X, Calendar, Star, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProjectFilters } from '../../types/project';
import FilterChips from './FilterChips';
import { HighlightText } from './HighlightText';

interface ProjectSearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
}

export default function ProjectSearchAndFilter({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
}: ProjectSearchAndFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<ProjectFilters>(filters);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setShowFilters(false);
  };

  const handleClearAll = () => {
    const cleared: ProjectFilters = {
      status: 'active',
      favorites: false,
      dateRange: undefined,
      tags: [],
    };
    onFiltersChange(cleared);
    setLocalFilters(cleared);
  };

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
  ];

  const quickDateRanges = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
  ];

  const setQuickDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setLocalFilters({
      ...localFilters,
      dateRange: { start, end },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-black/40" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-brand-paper text-sm text-brand-black placeholder-brand-black/30 focus:outline-none focus:border-violet-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-brand-offwhite text-brand-black/40 hover:text-brand-black"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
            showFilters
              ? 'border-violet-500 bg-violet-500/10 text-violet-700'
              : 'border-brand-border hover:border-brand-black/30 text-brand-black/60 hover:text-brand-black'
          }`}
        >
          <Filter size={16} />
          <span className="text-sm font-medium">Filters</span>
        </button>
      </div>

      <FilterChips
        filters={filters}
        onFiltersChange={onFiltersChange}
        onClearAll={handleClearAll}
      />

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="border border-brand-border rounded-xl bg-brand-paper p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif italic text-brand-black">Filter Options</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1.5 rounded-lg hover:bg-brand-paper text-brand-black/40 hover:text-brand-black"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-brand-black/50 flex items-center gap-1.5">
                  <Calendar size={12} />
                  Status
                </label>
                <div className="flex gap-2">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setLocalFilters({ ...localFilters, status: option.value as any })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        localFilters.status === option.value
                          ? 'bg-violet-500 text-white'
                          : 'bg-brand-offwhite text-brand-black/60 hover:bg-brand-paper'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-brand-black/50 flex items-center gap-1.5">
                  <Star size={12} />
                  Favorites
                </label>
                <button
                  onClick={() => setLocalFilters({ ...localFilters, favorites: !localFilters.favorites })}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                    localFilters.favorites
                      ? 'bg-amber-500 text-white'
                      : 'bg-brand-offwhite text-brand-black/60 hover:bg-brand-paper'
                  }`}
                >
                  <Star size={12} fill={localFilters.favorites ? 'currentColor' : 'none'} />
                  {localFilters.favorites ? 'Showing Favorites' : 'Show Only Favorites'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-brand-black/50 flex items-center gap-1.5">
                <Calendar size={12} />
                Date Range
              </label>
              <div className="relative" ref={datePickerRef}>
                <button
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="w-full px-3 py-2 rounded-lg border border-brand-border bg-brand-paper text-xs text-brand-black text-left flex items-center justify-between"
                >
                  {localFilters.dateRange ? (
                    <span>
                      {new Date(localFilters.dateRange.start).toLocaleDateString()} - {new Date(localFilters.dateRange.end).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-brand-black/40">Select date range</span>
                  )}
                  {isDatePickerOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                <AnimatePresence>
                  {isDatePickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-full bg-brand-paper border border-brand-border rounded-xl shadow-xl p-3 z-50"
                    >
                      <div className="space-y-1.5">
                        {quickDateRanges.map(range => (
                          <button
                            key={range.days}
                            onClick={() => {
                              setQuickDateRange(range.days);
                              setIsDatePickerOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-paper text-xs text-brand-black/70 hover:text-brand-black transition-colors"
                          >
                            {range.label}
                          </button>
                        ))}
                        <div className="h-px bg-brand-border my-2" />
                        <button
                          onClick={() => {
                            setLocalFilters({ ...localFilters, dateRange: undefined });
                            setIsDatePickerOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-paper text-xs text-red-500 transition-colors"
                        >
                          Clear Date Filter
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border/50">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-brand-black/60 hover:text-brand-black hover:bg-brand-paper transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
