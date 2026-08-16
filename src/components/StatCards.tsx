import React from 'react';
import { Ticket, Calendar, Clock, Star } from 'lucide-react';
import { FilterStatus } from '../types.ts';

interface StatCardsProps {
  totalCount: number;
  upcomingCount: number;
  pastCount: number;
  favoritesCount: number;
  activeStatus: FilterStatus;
  onSelectStatus: (status: FilterStatus) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalCount,
  upcomingCount,
  pastCount,
  favoritesCount,
  activeStatus,
  onSelectStatus,
}) => {
  const stats = [
    {
      id: 'stat-all',
      status: 'all' as FilterStatus,
      label: 'Total Tickets',
      count: totalCount,
      icon: Ticket,
      color: 'indigo',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      activeRing: 'ring-2 ring-indigo-600 bg-indigo-50/50',
    },
    {
      id: 'stat-upcoming',
      status: 'upcoming' as FilterStatus,
      label: 'Upcoming Events',
      count: upcomingCount,
      icon: Calendar,
      color: 'emerald',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      activeRing: 'ring-2 ring-emerald-600 bg-emerald-50/50',
    },
    {
      id: 'stat-past',
      status: 'past' as FilterStatus,
      label: 'Past Events',
      count: pastCount,
      icon: Clock,
      color: 'slate',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      activeRing: 'ring-2 ring-slate-600 bg-slate-100/70',
    },
    {
      id: 'stat-favorites',
      status: 'favorites' as FilterStatus,
      label: 'Favorite Tickets',
      count: favoritesCount,
      icon: Star,
      color: 'amber',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      activeRing: 'ring-2 ring-amber-500 bg-amber-50/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isActive = activeStatus === stat.status;

        return (
          <button
            key={stat.id}
            id={stat.id}
            onClick={() => onSelectStatus(stat.status)}
            className={`text-left p-4 rounded-xl border transition-all duration-150 relative overflow-hidden bg-white shadow-xs ${
              isActive
                ? `${stat.activeRing} border-transparent`
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-slate-500">{stat.label}</span>
              <div className={`p-2 rounded-lg border ${stat.badgeBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {stat.count}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {stat.count === 1 ? 'ticket' : 'tickets'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
