// src/components/CommitHistory/CommitHistory.tsx - ATUALIZADO
import React, { useMemo } from 'react';
import { GitCommit, BarChart3, List, Clock, GitBranch, RefreshCw, RotateCcw, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { useGitHub } from '../../context/GitHubContext';

// Componentes modulares
import CommitAnalytics from './CommitAnalytics';
import CommitList from './CommitList';
import CommitTimeline from './CommitTimeline';
import CommitFilters from './CommitFilters';

// Hooks personalizados
import { useCommitData } from './hooks/useCommitData';
import { useCommitFilters } from './hooks/useCommitFilters';
import { useCommitAnalytics } from './hooks/useCommitAnalytics';

import type { ViewMode } from './types';
import { getTimeFilterLabel } from './types';

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
    limitedCommitsForList,
    allFilteredCommitsForAnalytics,
    uniqueAuthors,
    totalFilteredCount,
    isFiltered
  } = useCommitFilters(currentCommits);
  
  // Hook para analytics dos commits (usando todos os commits filtrados)
  const analytics = useCommitAnalytics(allFilteredCommitsForAnalytics);

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

  // REPLICAR: Lógica do Dashboard que funciona
  const statsForDisplay = useMemo(() => {
    // Usar mesma lógica do useDashboardData.ts que funciona
    const totalCommits = currentCommits.length;
    const filteredCommits = totalFilteredCount;
    const displayCommits = limitedCommitsForList.length;
    const analyticsCommits = analytics.totalCommits;

    return {
      source: totalCommits > 0 ? 'API Real' : 'Nenhum',
      total: totalCommits,
      filtered: filteredCommits,
      displayed: displayCommits,
      analytics: analyticsCommits,
      isReal: totalCommits > 0
    };
  }, [currentCommits.length, totalFilteredCount, limitedCommitsForList.length, analytics.totalCommits]);

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
      {/* Header Principal - REPLICANDO LÓGICA DO DASHBOARD */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <GitCommit className="w-8 h-8 text-green-500" />
              Histórico Completo de Commits
            </h1>
            <p className="text-slate-400 text-lg mb-4">
              Análise de commits reais coletados via API GitHub
            </p>
            
            {/* Stats REPLICANDO STATSGRID QUE FUNCIONA */}
            {statsForDisplay.total > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {/* Commits Totais Coletados - IGUAL AO DASHBOARD */}
                <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm font-medium mb-1">Commits Coletados</p>
                      <p className="text-2xl font-bold text-white">{statsForDisplay.total.toLocaleString()}</p>
                      <div className="flex items-center space-x-1 text-green-400">
                        <GitCommit className="w-3 h-3" />
                        <span className="text-xs font-medium">API GitHub Real</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-xs text-green-300">✅ Fonte: {statsForDisplay.source}</span>
                      </div>
                    </div>
                    <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                      <GitCommit className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Commits Filtrados */}
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm font-medium mb-1">Pós-Filtros</p>
                      <p className="text-2xl font-bold text-white">{statsForDisplay.filtered.toLocaleString()}</p>
                      <div className="flex items-center space-x-1 text-blue-400">
                        <span className="text-xs font-medium">Filtrados</span>
                      </div>
                    </div>
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Analytics */}
                <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm font-medium mb-1">Analytics</p>
                      <p className="text-2xl font-bold text-white">{statsForDisplay.analytics.toLocaleString()}</p>
                      <div className="flex items-center space-x-1 text-purple-400">
                        <span className="text-xs font-medium">Processados</span>
                      </div>
                    </div>
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Lista Exibida */}
                <div className="bg-orange-600/10 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm font-medium mb-1">Lista</p>
                      <p className="text-2xl font-bold text-white">{statsForDisplay.displayed}</p>
                      <div className="flex items-center space-x-1 text-orange-400">
                        <span className="text-xs font-medium">Top exibidos</span>
                      </div>
                    </div>
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                      <List className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Controles de Visualização */}
          {totalFilteredCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 mr-2">Visualizar como:</span>
              {renderViewControls()}
            </div>
          )}
        </div>
        
        {/* Debug Info - IGUAL AO STATSGRID */}
        {statsForDisplay.total > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <h4 className="text-slate-300 font-medium mb-2">📊 Debug Info</h4>
              <div className="text-xs text-slate-400 space-y-1">
                <div>✅ Fonte: {statsForDisplay.source}</div>
                <div>📦 Total coletado: {statsForDisplay.total}</div>
                <div>🔍 Filtrados: {statsForDisplay.filtered}</div>
                <div>📋 Exibidos: {statsForDisplay.displayed}</div>
                <div>📊 Analytics: {statsForDisplay.analytics}</div>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <h4 className="text-slate-300 font-medium mb-2">🔄 Status da Busca</h4>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Repositórios: {repositories.length}</div>
                <div>Selecionado: {filters.selectedRepo || 'Nenhum'}</div>
                <div>Branch: {filters.selectedBranch}</div>
                <div>Carregando: {isCurrentlyLoading ? 'Sim' : 'Não'}</div>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <h4 className="text-slate-300 font-medium mb-2">⚡ Performance</h4>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Filtros ativos: {isFiltered ? 'Sim' : 'Não'}</div>
                <div>Modo visualização: {viewMode}</div>
                <div>Analytics ativo: {showAnalytics ? 'Sim' : 'Não'}</div>
                <div>Autores únicos: {uniqueAuthors.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Info sobre busca completa */}
        {filters.selectedRepo === 'all' && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-400 font-medium mb-1">Busca Completa - Método Dashboard</p>
                <p className="text-slate-300 leading-relaxed">
                  Utilizando a <strong>mesma metodologia do Dashboard</strong> que funciona corretamente. 
                  Coleta de <strong>TODOS os {repositories.length} repositórios</strong> via API real.
                </p>
                <div className="mt-2 text-xs text-slate-400">
                  <p>🔄 <strong>Metodologia:</strong> Igual ao Dashboard (que funciona)</p>
                  <p>⚡ <strong>Dados:</strong> 100% reais da API GitHub</p>
                  <p>🎯 <strong>Objetivo:</strong> Máxima cobertura histórica</p>
                </div>
                {allReposCommits.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium">
                        {allReposCommits.length.toLocaleString()} commits coletados (REAL)
                      </span>
                    </div>
                    {loadingAllRepos && (
                      <div className="bg-slate-700/30 rounded-full h-2 mt-2">
                        <div className="bg-blue-500 h-2 rounded-full animate-pulse w-full" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Seção de Configuração */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Repositório */}
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
                <option value="all">Todos os repositórios ({repositories.length})</option>
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
            <h3 className="text-lg font-semibold text-white">Controles</h3>
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

            {isFiltered && (
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
            <h4 className="text-xs font-medium text-slate-300 mb-2">💡 Filtros Avançados</h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Filtros de segundos até anos</li>
              <li>• Lista limitada a 10 commits</li>
              <li>• Analytics usa todos os dados filtrados</li>
              <li>• Ctrl+K para busca rápida</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Nota sobre Metodologia - ATUALIZADA */}
      {currentCommits.length > 0 && (
        <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-green-400 mt-0.5">📊</div>
            <div>
              <h4 className="text-green-400 font-medium mb-1">Coleta Completa Realizada</h4>
              <p className="text-green-300/80 text-sm">
                <strong>{currentCommits.length.toLocaleString()} commits</strong> foram coletados do histórico completo. 
                Todos os filtros são aplicados sobre este conjunto total para máxima precisão.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-green-300">📋 Lista:</span> Top 10 commits mais relevantes
                </div>
                <div>
                  <span className="text-green-300">📊 Analytics:</span> Todos os {totalFilteredCount} commits filtrados
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros Avançados */}
      {currentCommits.length > 0 && (
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <CommitFilters
            filters={filters}
            uniqueAuthors={uniqueAuthors}
            showAnalytics={showAnalytics}
            totalFilteredCount={totalFilteredCount}
            isFiltered={isFiltered}
            onUpdateFilter={updateFilter}
            onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
            onResetFilters={resetFilters}
          />
        </div>
      )}

      {/* Analytics Dashboard Separado */}
      {showAnalytics && analytics.totalCommits > 0 && viewMode !== 'analytics' && (
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Analytics de Commits Filtrados
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">
                Analisando {analytics.totalCommits} commits
              </span>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Ocultar Analytics
              </button>
            </div>
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
                ? 'Coletando histórico completo de commits' 
                : 'Carregando commits do repositório'
              }
            </h3>
            <p className="text-slate-400 text-center max-w-md">
              {filters.selectedRepo === 'all'
                ? 'Processando todos os repositórios. A busca continuará até coletar 100% dos commits disponíveis.'
                : 'Aguarde enquanto carregamos o histórico de commits...'
              }
            </p>
            {filters.selectedRepo === 'all' && allReposCommits.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-blue-400 font-medium">
                  {allReposCommits.length.toLocaleString()} commits coletados...
                </p>
                <p className="text-slate-500 text-sm">
                  Busca em andamento
                </p>
              </div>
            )}
          </div>
        ) : totalFilteredCount > 0 ? (
          // Conteúdo com base no modo de visualização
          <div className="p-6">
            {viewMode === 'timeline' ? (
              <CommitTimeline commits={limitedCommitsForList} />
            ) : viewMode === 'analytics' ? (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Visualização Analytics Detalhada
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Métricas avançadas de {analytics.totalCommits} commits filtrados
                  </p>
                  {filters.timeFilter !== 'all' && (
                    <p className="text-blue-400 text-sm">
                      Período: {getTimeFilterLabel(filters.timeFilter)}
                    </p>
                  )}
                </div>
                <CommitAnalytics analytics={analytics} />
              </div>
            ) : (
              <CommitList
                commits={limitedCommitsForList}
                selectedRepo={filters.selectedRepo}
                selectedBranch={filters.selectedBranch}
                allReposCommits={allReposCommits}
                totalFilteredCount={totalFilteredCount}
                isFiltered={isFiltered}
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
              {isFiltered ? 'Nenhum commit corresponde aos filtros aplicados' : 
               filters.selectedRepo === 'all' ? 'Nenhum commit foi encontrado nos repositórios selecionados' :
               'Este repositório não possui commits no branch selecionado'}
            </p>
            {isFiltered && (
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
              <h4 className="text-white font-semibold mb-3">Novos recursos:</h4>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  Filtros de tempo precisos: segundos até anos
                </li>
                <li className="flex items-start gap-2">
                  Analytics completos dos dados filtrados
                </li>
                <li className="flex items-start gap-2">
                  Lista otimizada com 10 commits mais relevantes
                </li>
                <li className="flex items-start gap-2">
                  Busca avançada por autor, SHA e conteúdo
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Nota final sobre dados coletados - SIMPLIFICADA */}
      {currentCommits.length > 0 && (
        <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-green-400 mt-0.5">✅</div>
            <div>
              <h4 className="text-green-400 font-medium mb-1">Histórico Completo Coletado</h4>
              <p className="text-green-300/80 text-sm">
                <strong>{currentCommits.length.toLocaleString()} commits</strong> foram coletados do histórico completo disponível. 
                Análises e filtros processam 100% destes dados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitHistory;
