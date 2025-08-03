// src/components/CommitHistory/CommitFilters.tsx
import React from 'react';
import { Search, BarChart3 } from 'lucide-react';
import type { CommitFiltersState } from './types';

interface CommitFiltersProps {
  filters: CommitFiltersState;
  uniqueAuthors: string[];
  showAnalytics: boolean;
  onUpdateFilter: (key: keyof CommitFiltersState, value: string) => void;
  onToggleAnalytics: () => void;
  onResetFilters: () => void;
}

const CommitFilters: React.FC<CommitFiltersProps> = ({
  filters,
  uniqueAuthors,
  showAnalytics,
  onUpdateFilter,
  onToggleAnalytics,
  onResetFilters
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Pesquisar commits, autores, SHA..."
            value={filters.searchTerm}
            onChange={(e) => onUpdateFilter('searchTerm', e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Time Filter */}
        <select
          value={filters.timeFilter}
          onChange={(e) => onUpdateFilter('timeFilter', e.target.value)}
          className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="all">Todos os períodos</option>
          <option value="hour">Última hora</option>
          <option value="day">Último dia</option>
          <option value="week">Última semana</option>
          <option value="month">Último mês</option>
          <option value="year">Último ano</option>
        </select>

        {/* Sort By */}
        <select
          value={filters.sortBy}
          onChange={(e) => onUpdateFilter('sortBy', e.target.value)}
          className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="date">Data</option>
          <option value="author">Autor</option>
          <option value="additions">Adições</option>
          <option value="deletions">Remoções</option>
          <option value="changes">Total de mudanças</option>
        </select>

        {/* Author Filter */}
        <select
          value={filters.selectedAuthor}
          onChange={(e) => onUpdateFilter('selectedAuthor', e.target.value)}
          className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="all">Todos os autores</option>
          {uniqueAuthors.map(author => (
            <option key={author} value={author}>{author}</option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-3">
          {/* Analytics Toggle */}
          <button
            onClick={onToggleAnalytics}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              showAnalytics 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>

          {/* Reset Filters */}
          <button
            onClick={onResetFilters}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg font-semibold transition-all duration-200"
          >
            Limpar Filtros
          </button>
        </div>

        {/* Filter Summary */}
        <div className="text-sm text-slate-400">
          {filters.searchTerm && (
            <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded mr-2">
              Busca: "{filters.searchTerm}"
            </span>
          )}
          {filters.selectedAuthor !== 'all' && (
            <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded mr-2">
              Autor: {filters.selectedAuthor}
            </span>
          )}
          {filters.timeFilter !== 'all' && (
            <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
              Período: {filters.timeFilter}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommitFilters;
