// src/components/CommitHistory/CommitHistory.tsx - Versão Final Modularizada
import React from 'react';
import { GitCommit } from 'lucide-react';
import { useGitHub } from '../../context/GitHubContext';

// Componentes modulares
import CommitHistoryHeader from './CommitHistoryHeader';
import CommitRepositorySelector from './CommitRepositorySelector';
import CommitAnalytics from './CommitAnalytics';
import CommitFilters from './CommitFilters';
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
  const [showAnalytics, setShowAnalytics] = React.useState(true);
  
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
    // Limpar commits quando trocar de repositório
    if (repoFullName !== 'all') {
      // commits serão atualizados pelo hook useCommitData
    }
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

  return (
    <div className="space-y-6">
      {/* Header com controles de visualização */}
      <CommitHistoryHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCommits={filteredCommits.length}
        totalRepositories={repositories.length}
      />

      {/* Seletor de repositório e branch */}
      <CommitRepositorySelector
        selectedRepo={filters.selectedRepo}
        selectedBranch={filters.selectedBranch}
        repositories={repositories}
        allReposCommits={allReposCommits}
        isLoading={isCurrentlyLoading}
        onRepoChange={handleRepoChange}
        onBranchChange={handleBranchChange}
        onRefresh={handleRefresh}
      />

      {/* Dashboard de Analytics */}
      {showAnalytics && analytics.totalCommits > 0 && (
        <CommitAnalytics analytics={analytics} />
      )}

      {/* Filtros avançados */}
      {currentCommits.length > 0 && (
        <CommitFilters
          filters={filters}
          uniqueAuthors={uniqueAuthors}
          showAnalytics={showAnalytics}
          onUpdateFilter={updateFilter}
          onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
          onResetFilters={resetFilters}
        />
      )}

      {/* Conteúdo baseado no modo de visualização */}
      {isCurrentlyLoading && currentCommits.length === 0 ? (
        // Estado de loading
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">
              {filters.selectedRepo === 'all' 
                ? 'Coletando commits de múltiplos repositórios...' 
                : 'Carregando commits detalhados...'
              }
            </p>
            {filters.selectedRepo === 'all' && (
              <p className="text-slate-500 text-sm mt-2">
                Isso pode levar alguns momentos (até {Math.min(10, repositories.length)} repositórios)
              </p>
            )}
          </div>
        </div>
      ) : filteredCommits.length > 0 ? (
        // Conteúdo principal
        <>
          {viewMode === 'timeline' ? (
            <CommitTimeline commits={filteredCommits.slice(0, 20)} />
          ) : viewMode === 'analytics' ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-6">
                Visualização de Analytics
              </h3>
              <p className="text-slate-400 mb-4">
                Esta visualização mostra métricas avançadas dos commits selecionados.
              </p>
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
        </>
      ) : filters.selectedRepo ? (
        // Estado de nenhum commit encontrado
        <div className="text-center py-12">
          <GitCommit className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Nenhum commit encontrado</h3>
          <p className="text-slate-500">
            {filters.searchTerm ? 'Tente ajustar os filtros de busca' : 
             filters.selectedRepo === 'all' ? 'Nenhum commit foi encontrado nos repositórios selecionados' :
             'Este repositório não possui commits no branch selecionado'}
          </p>
          {(filters.searchTerm || filters.selectedAuthor !== 'all' || filters.timeFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        // Estado inicial - selecione um repositório
        <div className="text-center py-12">
          <GitCommit className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Selecione um repositório</h3>
          <p className="text-slate-500">Escolha um repositório para visualizar o histórico detalhado de commits</p>
          <div className="mt-6 text-sm text-slate-400 max-w-md mx-auto">
            <p className="mb-2">💡 <strong>Dicas:</strong></p>
            <ul className="text-left space-y-1">
              <li>• Selecione "Todos os repositórios" para uma visão global</li>
              <li>• Use os filtros para encontrar commits específicos</li>
              <li>• Visualize o timeline para uma perspectiva cronológica</li>
              <li>• Explore os analytics para insights detalhados</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitHistory;
