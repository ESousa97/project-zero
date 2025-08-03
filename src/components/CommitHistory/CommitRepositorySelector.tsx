// src/components/CommitHistory/CommitRepositorySelector.tsx
import React from 'react';
import type { Repository, Commit } from '../../types/github';

interface CommitRepositorySelectorProps {
  selectedRepo: string;
  selectedBranch: string;
  repositories: Repository[];
  allReposCommits: Commit[];
  isLoading: boolean;
  onRepoChange: (repo: string) => void;
  onBranchChange: (branch: string) => void;
  onRefresh: () => void;
}

const CommitRepositorySelector: React.FC<CommitRepositorySelectorProps> = ({
  selectedRepo,
  selectedBranch,
  repositories,
  allReposCommits,
  isLoading,
  onRepoChange,
  onBranchChange,
  onRefresh
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Repository Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Repositório
          </label>
          <select
            value={selectedRepo}
            onChange={(e) => onRepoChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Selecione um repositório</option>
            <option value="all">🌟 Todos os repositórios ({repositories.length} total)</option>
            {repositories.map(repo => (
              <option key={repo.id} value={repo.full_name}>
                {repo.name} ({repo.default_branch})
              </option>
            ))}
          </select>
        </div>

        {/* Branch Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Branch
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => onBranchChange(e.target.value)}
            disabled={!selectedRepo || selectedRepo === 'all'}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="main">main</option>
            <option value="master">master</option>
            <option value="develop">develop</option>
            <option value="dev">dev</option>
          </select>
          {selectedRepo === 'all' && (
            <p className="text-xs text-slate-400 mt-1">
              Usando branch padrão de cada repositório
            </p>
          )}
        </div>

        {/* Author Filter Placeholder */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Status
          </label>
          <div className="px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${selectedRepo ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-sm text-slate-300">
                {selectedRepo ? 'Repositório selecionado' : 'Aguardando seleção'}
              </span>
            </div>
            {selectedRepo === 'all' && allReposCommits.length > 0 && (
              <p className="text-xs text-green-400 mt-1">
                {allReposCommits.length} commits coletados
              </p>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex items-end">
          <button
            onClick={onRefresh}
            disabled={!selectedRepo || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {selectedRepo === 'all' ? 'Coletando de todos...' : 'Carregando...'}
              </>
            ) : (
              selectedRepo === 'all' ? 'Buscar de Todos' : 'Buscar Commits'
            )}
          </button>
        </div>
      </div>
      
      {/* Info Card for "All Repositories" */}
      {selectedRepo === 'all' && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-blue-400 mt-0.5">ℹ️</div>
            <div className="text-sm">
              <p className="text-blue-400 font-medium mb-1">Busca em Todos os Repositórios</p>
              <p className="text-slate-300">
                Esta opção coletará commits dos {Math.min(10, repositories.length)} repositórios mais recentes. 
                Cada repositório pode retornar até 100 commits recentes.
              </p>
              {allReposCommits.length > 0 && (
                <p className="text-green-400 mt-2 font-medium">
                  ✅ {allReposCommits.length} commits coletados de múltiplos repositórios
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitRepositorySelector;
