// src/components/CommitHistory/CommitRepositorySelector.tsx - Botão Corrigido
import React from 'react';
import { RefreshCw, Search, GitBranch, CheckCircle, AlertCircle } from 'lucide-react';
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
        {/* Repository Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <GitBranch className="w-4 h-4 text-blue-400" />
            Repositório
          </label>
          <select
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

        {/* Branch Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <GitBranch className="w-4 h-4 text-green-400" />
            Branch
          </label>
          <select
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
            <p className="text-xs text-slate-400 mt-1">
              Usando branch padrão de cada repositório
            </p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <CheckCircle className="w-4 h-4 text-purple-400" />
            Status
          </label>
          <div className="px-3 py-2.5 bg-slate-700/30 border border-slate-600 rounded-lg">
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

        {/* Search/Refresh Button - CORRIGIDO */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Search className="w-4 h-4 text-orange-400" />
            Ação
          </label>
          <button
            onClick={onRefresh}
            disabled={!selectedRepo || isLoading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{selectedRepo === 'all' ? 'Coletando...' : 'Carregando...'}</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Buscar Commits</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Info Card for "All Repositories" - ATUALIZADO */}
      {selectedRepo === 'all' && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-400 font-medium mb-1">Busca Completa em Todos os Repositórios</p>
              <p className="text-slate-300 leading-relaxed">
                Esta opção coletará <strong>TODOS os commits históricos</strong> dos {Math.min(10, repositories.length)} repositórios mais recentes. 
                Cada repositório pode retornar até 2.000 commits (histórico completo).
              </p>
              <div className="mt-2 text-xs text-slate-400">
                <p>📊 <strong>Analytics:</strong> Processará todos os commits coletados</p>
                <p>📋 <strong>Lista:</strong> Exibirá apenas os 10 commits mais relevantes após filtros</p>
                <p>⏱️ <strong>Tempo:</strong> Pode levar 1-3 minutos para busca completa</p>
              </div>
              {allReposCommits.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
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
