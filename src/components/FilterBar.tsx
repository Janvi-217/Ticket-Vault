import React from 'react';
import { Search, X, Film, Music, Trophy, GraduationCap, Sparkles, Filter } from 'lucide-react';
import { FilterStatus, EventType } from '../types.ts';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  totalFilteredCount: number;
}

const eventTypes: { label: string; value: string; icon: React.ElementType }[] = [
  { label: 'All Categories', value: 'All', icon: Sparkles },
  { label: 'Movie', value: 'Movie', icon: Film },
  { label: 'Concert', value: 'Concert', icon: Music },
  { label: 'Sports', value: 'Sports', icon: Trophy },
  { label: 'College', value: 'College', icon: GraduationCap },
  { label: 'Other', value: 'Other', icon: Filter },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  selectedType,
  onTypeChange,
  totalFilteredCount,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-xs space-y-3.5">
      {/* Top row: Search and Status Tabs */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-search-tickets"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by event name, venue, or ticket #..."
            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              id="btn-clear-search"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto overflow-x-auto max-w-full">
          {(
            [
              { label: 'All', value: 'all' },
              { label: 'Upcoming', value: 'upcoming' },
              { label: 'Past', value: 'past' },
              { label: 'Favorites', value: 'favorites' },
            ] as { label: string; value: FilterStatus }[]
          ).map((tab) => (
            <button
              key={tab.value}
              id={`tab-status-${tab.value}`}
              onClick={() => onStatusChange(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          <span className="text-xs font-medium text-slate-400 mr-1 hidden sm:inline">Category:</span>
          {eventTypes.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedType === cat.value;
            return (
              <button
                key={cat.value}
                id={`chip-type-${cat.value.toLowerCase()}`}
                onClick={() => onTypeChange(cat.value)}
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-semibold'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium whitespace-nowrap pl-2">
          Showing <span className="font-bold text-slate-900">{totalFilteredCount}</span> results
        </div>
      </div>
    </div>
  );
};
