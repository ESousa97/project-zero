// src/components/CommitHistory/CommitFilters.tsx - Layout Melhorado
import React from 'react';
import { Search, BarChart3, Filter, RotateCcw, Users, Calendar, SortAsc } from 'lucide-react';
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
  // Verificar se há filtros aplicados
  const hasActiveFilters = filters.searchTerm || 
                          filters.selectedAuthor !== 'all' || 
                          filters.timeFilter !== 'all' ||
                          filters.sortBy !== 'date';

  const activeFilterCount = [
    filters.searchTerm,
    filters.selectedAuthor !== 'all' ? filters.selectedAuthor : null,
    filters.timeFilter !== 'all' ? filters.timeFilter : null,
    filters.sortBy !== 'date' ? filters.sortBy : null
  ].filter(Boolean).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Filtros e Busca</h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
              {activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''} ativo{activeFilterCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Analytics Toggle */}
          <button
            onClick={onToggleAnalytics}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              showAnalytics 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-red-600/20 text-slate-300 hover:text-red-400 rounded-lg font-medium transition-all duration-200 border border-slate-600 hover:border-red-500/50"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Main Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Search className="w-4 h-4 text-blue-400" />
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Commits, autores, SHA..."
              value={filters.searchTerm}
              onChange={(e) => onUpdateFilter('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Time Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Calendar className="w-4 h-4 text-green-400" />
            Período
          </label>
          <select
            value={filters.timeFilter}
            onChange={(e) => onUpdateFilter('timeFilter', e.target.value)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="all">Todos os períodos</option>
            <option value="hour">Última hora</option>
            <option value="day">Último dia</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
            <option value="year">Último ano</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <SortAsc className="w-4 h-4 text-purple-400" />
            Ordenar por
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onUpdateFilter('sortBy', e.target.value)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="date">Data (mais recente)</option>
            <option value="author">Autor (A-Z)</option>
            <option value="additions">Adições (maior)</option>
            <option value="deletions">Remoções (maior)</option>
            <option value="changes">Total de mudanças</option>
          </select>
        </div>

        {/* Author Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Users className="w-4 h-4 text-orange-400" />
            Autor
          </label>
          <select
            value={filters.selectedAuthor}
            onChange={(e) => onUpdateFilter('selectedAuthor', e.target.value)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="all">Todos os autores ({uniqueAuthors.length})</option>
            {uniqueAuthors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-300">Filtros ativos:</span>
            
            {filters.searchTerm && (
              <span className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                <Search className="w-3 h-3" />
                Busca: "{filters.searchTerm}"
                <button
                  onClick={() => onUpdateFilter('searchTerm', '')}
                  className="ml-1 hover:bg-blue-600/30 rounded-full p-0.5 transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.selectedAuthor !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                <Users className="w-3 h-3" />
                Autor: {filters.selectedAuthor}
                <button
                  onClick={() => onUpdateFilter('selectedAuthor', 'all')}
                  className="ml-1 hover:bg-green-600/30 rounded-full p-0.5 transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.timeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-xs font-medium">
                <Calendar className="w-3 h-3" />
                Período: {filters.timeFilter}
                <button
                  onClick={() => onUpdateFilter('timeFilter', 'all')}
                  className="ml-1 hover:bg-purple-600/30 rounded-full p-0.5 transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.sortBy !== 'date' && (
              <span className="inline-flex items-center gap-1 bg-orange-600/20 text-orange-400 px-3 py-1 rounded-full text-xs font-medium">
                <SortAsc className="w-3 h-3" />
                Ordem: {filters.sortBy}
                <button
                  onClick={() => onUpdateFilter('sortBy', 'date')}
                  className="ml-1 hover:bg-orange-600/30 rounded-full p-0.5 transition-colors"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!hasActiveFilters && (
        <div className="bg-slate-700/20 rounded-lg p-4 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-1">Ações rápidas</h4>
              <p className="text-xs text-slate-400">Use os filtros acima para refinar sua pesquisa</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Dica: Use Ctrl+F para busca rápida</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitFilters;
