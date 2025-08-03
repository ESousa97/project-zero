// src/components/CommitHistory/CommitHistory.tsx - Layout Melhorado
import React from 'react';
import { GitCommit, BarChart3, List, Clock, GitBranch, RefreshCw, RotateCcw, Search, Users, Calendar, SortAsc } from 'lucide-react';
import { useGitHub } from '../../context/GitHubContext';

// Componentes modulares
import CommitAnalytics from './CommitAnalytics';
import CommitList from './CommitList';
import CommitTimeline from './CommitTimeline';

// Hooks personalizados
import { useCommitData } from './hooks/useCommitData';
import { useCommitFilters } from './hooks/useCommitFilters';
import { useCommitAnalytics } from './hooks/useCommitAnalytics';

import type { ViewMode } from './types';

const CommitHistory: React.FC = () => {
  const { repositories, loading, fetchCommits } = useGitHub();
  
  // Estados locais
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [showAnalytics, setShowAnalytics] = React.useState(false);
  
  // Hooks personalizados para gerenciamento de dados
  const {
    currentCommits,
    allReposCommits,
    loadingAllRepos,
    fetchAllRepositoriesCommits
  } = useCommitData();
  
  // Hooks para filtros e processamento de commits
  const {
    filters,
    updateFilter,
    resetFilters,
    filteredCommits,
    uniqueAuthors
  } = useCommitFilters(currentCommits);
  
  // Hook para analytics dos commits
  const analytics = useCommitAnalytics(filteredCommits);

  // Handlers
  const handleRepoChange = (repoFullName: string) => {
    updateFilter('selectedRepo', repoFullName);
  };

  const handleBranchChange = (branch: string) => {
    updateFilter('selectedBranch', branch);
  };

  const handleRefresh = () => {
    if (filters.selectedRepo === 'all') {
      fetchAllRepositoriesCommits();
    } else if (filters.selectedRepo) {
      fetchCommits(filters.selectedRepo, filters.selectedBranch);
    }
  };

  // Determinar se está carregando
  const isCurrentlyLoading = filters.selectedRepo === 'all' ? loadingAllRepos : loading;

  // Função para renderizar os controles de visualização
  const renderViewControls = () => (
    <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
      <button
        onClick={() => setViewMode('list')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          viewMode === 'list'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'
        }`}
      >
        <List className="w-4 h-4" />
        Lista
      </button>
      <button
        onClick={() => setViewMode('timeline')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          viewMode === 'timeline'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'
        }`}
      >
        <Clock className="w-4 h-4" />
        Timeline
      </button>
      <button
        onClick={() => setViewMode('analytics')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          viewMode === 'analytics'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        Analytics
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Principal */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <GitCommit className="w-8 h-8 text-green-500" />
              Histórico de Commits
            </h1>
            <p className="text-slate-400 text-lg mb-4">
              Análise detalhada de commits com métricas avançadas
            </p>
            
            {/* Stats resumidas */}
            {filteredCommits.length > 0 && (
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-300 font-medium">{filteredCommits.length}</span>
                  <span className="text-slate-400">commits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-slate-300 font-medium">{repositories.length}</span>
                  <span className="text-slate-400">repositórios</span>
                </div>
                {analytics.totalAuthors > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300 font-medium">{analytics.totalAuthors}</span>
                    <span className="text-slate-400">autores</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Controles de Visualização - Mais proeminentes */}
          {filteredCommits.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 mr-2">Visualizar como:</span>
              {renderViewControls()}
            </div>
          )}
        </div>
      </div>

      {/* Seção de Configuração */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Repositório - Expandida */}
        <div className="lg:col-span-2 bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <GitBranch className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Configuração da Fonte</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Repository Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Repositório
              </label>
              <select
                value={filters.selectedRepo}
                onChange={(e) => handleRepoChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Selecione um repositório</option>
                <option value="all">🌟 Todos os repositórios ({repositories.length})</option>
                {repositories.map(repo => (
                  <option key={repo.id} value={repo.full_name}>
                    {repo.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Branch
              </label>
              <select
                value={filters.selectedBranch}
                onChange={(e) => handleBranchChange(e.target.value)}
                disabled={!filters.selectedRepo || filters.selectedRepo === 'all'}
                className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="main">main</option>
                <option value="master">master</option>
                <option value="develop">develop</option>
                <option value="dev">dev</option>
              </select>
            </div>

            {/* Action Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Ação
              </label>
              <button
                onClick={handleRefresh}
                disabled={!filters.selectedRepo || isCurrentlyLoading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isCurrentlyLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Carregando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Buscar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Info */}
          {filters.selectedRepo && (
            <div className="mt-4 p-3 bg-slate-700/20 rounded-lg border border-slate-600/50">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${filters.selectedRepo === 'all' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                <span className="text-slate-300">
                  {filters.selectedRepo === 'all' 
                    ? `Múltiplos repositórios • ${allReposCommits.length} commits coletados`
                    : `${filters.selectedRepo} • Branch: ${filters.selectedBranch}`
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Ações Rápidas */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Ações</h3>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                showAnalytics 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {showAnalytics ? 'Ocultar Analytics' : 'Mostrar Analytics'}
            </button>

            {(filters.searchTerm || filters.selectedAuthor !== 'all' || filters.timeFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-red-600/20 text-slate-300 hover:text-red-400 rounded-lg font-medium transition-all duration-200 border border-slate-600 hover:border-red-500/50"
              >
                <RotateCcw className="w-4 h-4" />
                Limpar Filtros
              </button>
            )}
          </div>

          {/* Info Helper */}
          <div className="mt-4 p-3 bg-slate-700/20 rounded-lg">
            <h4 className="text-xs font-medium text-slate-300 mb-2">💡 Dicas</h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Ctrl+K para busca rápida</li>
              <li>• Use "Todos" para visão global</li>
              <li>• Analytics mostra métricas detalhadas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filtros - Redesenhados e Mais Claros */}
      {currentCommits.length > 0 && (
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Filtros de Busca</h3>
                {(filters.searchTerm || filters.selectedAuthor !== 'all' || filters.timeFilter !== 'all' || filters.sortBy !== 'date') && (
                  <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                    Filtros ativos
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Search className="w-4 h-4 text-blue-400" />
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Commits, autores, SHA..."
                    value={filters.searchTerm}
                    onChange={(e) => updateFilter('searchTerm', e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  onChange={(e) => updateFilter('timeFilter', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="date">Data (recente)</option>
                  <option value="author">Autor (A-Z)</option>
                  <option value="additions">Mais adições</option>
                  <option value="deletions">Mais remoções</option>
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
                  onChange={(e) => updateFilter('selectedAuthor', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">Todos ({uniqueAuthors.length})</option>
                  {uniqueAuthors.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(filters.searchTerm || filters.selectedAuthor !== 'all' || filters.timeFilter !== 'all' || filters.sortBy !== 'date') && (
              <div className="mt-4 p-4 bg-slate-700/20 rounded-lg border border-slate-600/50">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-300">Filtros ativos:</span>
                  
                  {filters.searchTerm && (
                    <span className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                      Busca: "{filters.searchTerm}"
                      <button onClick={() => updateFilter('searchTerm', '')} className="hover:bg-blue-600/30 rounded p-0.5">×</button>
                    </span>
                  )}
                  
                  {filters.selectedAuthor !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">
                      Autor: {filters.selectedAuthor}
                      <button onClick={() => updateFilter('selectedAuthor', 'all')} className="hover:bg-green-600/30 rounded p-0.5">×</button>
                    </span>
                  )}
                  
                  {filters.timeFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs">
                      Período: {filters.timeFilter}
                      <button onClick={() => updateFilter('timeFilter', 'all')} className="hover:bg-purple-600/30 rounded p-0.5">×</button>
                    </span>
                  )}
                  
                  {filters.sortBy !== 'date' && (
                    <span className="inline-flex items-center gap-1 bg-orange-600/20 text-orange-400 px-2 py-1 rounded text-xs">
                      Ordem: {filters.sortBy}
                      <button onClick={() => updateFilter('sortBy', 'date')} className="hover:bg-orange-600/30 rounded p-0.5">×</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Dashboard Separado - Apenas quando showAnalytics estiver ativo */}
      {showAnalytics && analytics.totalCommits > 0 && viewMode !== 'analytics' && (
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Analytics de Commits
            </h2>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Ocultar Analytics
            </button>
          </div>
          <CommitAnalytics analytics={analytics} />
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50">
        {isCurrentlyLoading && currentCommits.length === 0 ? (
          // Estado de Loading
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <GitCommit className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-semibold text-white mt-4 mb-2">
              {filters.selectedRepo === 'all' 
                ? 'Coletando commits de múltiplos repositórios' 
                : 'Carregando commits detalhados'
              }
            </h3>
            <p className="text-slate-400 text-center max-w-md">
              {filters.selectedRepo === 'all'
                ? `Processando até ${Math.min(10, repositories.length)} repositórios. Isso pode levar alguns momentos.`
                : 'Aguarde enquanto carregamos o histórico de commits...'
              }
            </p>
          </div>
        ) : filteredCommits.length > 0 ? (
          // Conteúdo com base no modo de visualização
          <div className="p-6">
            {viewMode === 'timeline' ? (
              <CommitTimeline commits={filteredCommits.slice(0, 20)} />
            ) : viewMode === 'analytics' ? (
              // CORRIGIDO: Apenas uma instância do analytics
              <div className="space-y-6">
                <div className="text-center py-4">
                  <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Visualização Analytics Detalhada
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Métricas avançadas e insights dos commits selecionados
                  </p>
                </div>
                <CommitAnalytics analytics={analytics} />
              </div>
            ) : (
              <CommitList
                commits={filteredCommits}
                selectedRepo={filters.selectedRepo}
                selectedBranch={filters.selectedBranch}
                allReposCommits={allReposCommits}
              />
            )}
          </div>
        ) : filters.selectedRepo ? (
          // Estado de nenhum commit encontrado
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <GitCommit className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              Nenhum commit encontrado
            </h3>
            <p className="text-slate-500 text-center mb-6">
              {filters.searchTerm ? 'Nenhum commit corresponde aos filtros aplicados' : 
               filters.selectedRepo === 'all' ? 'Nenhum commit foi encontrado nos repositórios selecionados' :
               'Este repositório não possui commits no branch selecionado'}
            </p>
            {(filters.searchTerm || filters.selectedAuthor !== 'all' || filters.timeFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        ) : (
          // Estado inicial - selecione um repositório
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <GitCommit className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              Selecione um repositório
            </h3>
            <p className="text-slate-500 text-center mb-8">
              Escolha um repositório para visualizar o histórico detalhado de commits
            </p>
            <div className="bg-slate-700/30 rounded-lg p-6 max-w-md">
              <h4 className="text-white font-semibold mb-3">Dicas de uso:</h4>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  Selecione "Todos os repositórios" para uma visão global
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  Use os filtros para encontrar commits específicos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  Explore o timeline para uma perspectiva cronológica
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">•</span>
                  Ative os analytics para insights detalhados
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitHistory;
