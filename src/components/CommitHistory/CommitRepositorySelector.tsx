// src/components/CommitHistory/CommitRepositorySelector.tsx
import React from 'react';
import { RefreshCw, Search, GitBranch, CheckCircle, AlertCircle, BarChart2, List, Clock } from 'lucide-react';
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
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Seletor de Repositório */}
        <div className="space-y-2">
          <label
            htmlFor="repo-select"
            className="flex items-center gap-2 text-sm font-medium text-slate-300"
          >
            <GitBranch className="w-4 h-4 text-blue-400" aria-hidden="true" />
            Repositório
          </label>
          <select
            id="repo-select"
            value={selectedRepo}
            onChange={(e) => onRepoChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="">Selecione um repositório</option>
            <option value="all">Todos os repositórios ({repositories.length} total)</option>
            {repositories.map(repo => (
              <option key={repo.id} value={repo.full_name}>
                {repo.name} ({repo.default_branch})
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de Branch */}
        <div className="space-y-2">
          <label
            htmlFor="branch-select"
            className="flex items-center gap-2 text-sm font-medium text-slate-300"
          >
            <GitBranch className="w-4 h-4 text-green-400" aria-hidden="true" />
            Branch
          </label>
          <select
            id="branch-select"
            value={selectedBranch}
            onChange={(e) => onBranchChange(e.target.value)}
            disabled={!selectedRepo || selectedRepo === 'all'}
            className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="main">main</option>
            <option value="master">master</option>
            <option value="develop">develop</option>
            <option value="dev">dev</option>
          </select>
          {selectedRepo === 'all' && (
            <p className="text-xs text-slate-400 mt-1">Usando branch padrão de cada repositório</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <CheckCircle className="w-4 h-4 text-purple-400" aria-hidden="true" />
            Status
          </label>
          <div className="px-3 py-2.5 bg-slate-700/30 border border-slate-600 rounded-lg">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  selectedRepo ? 'bg-green-500' : 'bg-gray-500'
                }`}
                aria-label={selectedRepo ? 'Repositório selecionado' : 'Nenhum repositório selecionado'}
                role="status"
              />
              <span className="text-sm text-slate-300">
                {selectedRepo ? 'Repositório selecionado' : 'Aguardando seleção'}
              </span>
            </div>
            {selectedRepo === 'all' && allReposCommits.length > 0 && (
              <p className="text-xs text-green-400 mt-1">{allReposCommits.length} commits coletados</p>
            )}
          </div>
        </div>

        {/* Botão de Buscar Commits */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Search className="w-4 h-4 text-orange-400" aria-hidden="true" />
            Ação
          </label>
          <button
            onClick={onRefresh}
            disabled={!selectedRepo || isLoading}
            type="button"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            aria-live="polite"
            aria-busy={isLoading}
            aria-disabled={!selectedRepo || isLoading}
          >
            {isLoading ? (
              <>
                <div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                <span>{selectedRepo === 'all' ? 'Coletando...' : 'Carregando...'}</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>Buscar Commits</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Informação sobre busca completa em todos os repositórios */}
      {selectedRepo === 'all' && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg" role="region" aria-live="polite" aria-label="Informações sobre busca completa">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="text-sm">
              <p className="text-blue-400 font-medium mb-1">Busca Completa em Todos os Repositórios</p>
              <p className="text-slate-300 leading-relaxed">
                Esta opção coletará <strong>TODOS os commits históricos</strong> dos {Math.min(10, repositories.length)} repositórios mais recentes. Cada repositório pode retornar até 2.000 commits (histórico completo).
              </p>
              <div className="mt-2 text-xs text-slate-400 space-y-1">
                <p className="flex items-center gap-1">
                  <BarChart2 className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
                  <strong>Analytics:</strong> Processará todos os commits coletados
                </p>
                <p className="flex items-center gap-1">
                  <List className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
                  <strong>Lista:</strong> Exibirá apenas os 10 commits mais relevantes após filtros
                </p>
                <p className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
                  <strong>Tempo:</strong> Pode levar 1-3 minutos para busca completa
                </p>
              </div>
              {allReposCommits.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" aria-hidden="true" />
                  <span className="text-green-400 font-medium">
                    {allReposCommits.length.toLocaleString()} commits coletados de múltiplos repositórios
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitRepositorySelector;
