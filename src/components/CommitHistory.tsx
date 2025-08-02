// src/components/CommitHistory.tsx

import React, { useState } from 'react';
import { GitCommit, Calendar, User, ExternalLink, Search, Hash, Plus, Minus } from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';

// Add proper types
type TimeFilter = 'all' | 'day' | 'week' | 'month';

interface CommitStats {
  additions: number;
  deletions: number;
  total: number;
}

// Define proper commit type (extend as needed)
interface CommitData {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
  };
  author?: {
    login: string;
    avatar_url: string;
  };
  stats?: CommitStats;
}

const CommitHistory: React.FC = () => {
  const { repositories, commits, loading, fetchCommits } = useGitHub();
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const filteredCommits = React.useMemo(() => {
    const filtered = commits.filter(commit => {
      const matchesSearch = commit.commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           commit.commit.author.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (timeFilter === 'all') return true;

      const commitDate = new Date(commit.commit.author.date);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - commitDate.getTime()) / (1000 * 60 * 60 * 24));

      switch (timeFilter) {
        case 'day':
          return diffInDays <= 1;
        case 'week':
          return diffInDays <= 7;
        case 'month':
          return diffInDays <= 30;
        default:
          return true;
      }
    });

    return filtered;
  }, [commits, searchTerm, timeFilter]);

  const handleRepoChange = (repoFullName: string) => {
    setSelectedRepo(repoFullName);
    if (repoFullName) {
      fetchCommits(repoFullName, selectedBranch);
    }
  };

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
    if (selectedRepo) {
      fetchCommits(selectedRepo, branch);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d atrás`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}m atrás`;
    return `${Math.floor(diffInSeconds / 31536000)}a atrás`;
  };

  // Fix: Replace 'any' with proper type
  const getCommitStats = (commit: CommitData): CommitStats | null => {
    if (commit.stats) {
      return {
        additions: commit.stats.additions,
        deletions: commit.stats.deletions,
        total: commit.stats.total
      };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Histórico de Commits</h1>
        <p className="text-slate-400">
          Visualize todos os commits dos seus repositórios com detalhes completos
        </p>
      </div>

      {/* Repository and Branch Selection */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Repositório
            </label>
            <select
              value={selectedRepo}
              onChange={(e) => handleRepoChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Selecione um repositório</option>
              {repositories.map(repo => (
                <option key={repo.id} value={repo.full_name}>
                  {repo.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
              disabled={!selectedRepo}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="main">main</option>
              <option value="master">master</option>
              <option value="develop">develop</option>
              <option value="dev">dev</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => selectedRepo && fetchCommits(selectedRepo, selectedBranch)}
              disabled={!selectedRepo || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200"
            >
              {loading ? 'Carregando...' : 'Buscar Commits'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {commits.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar commits por mensagem ou autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">Todos os períodos</option>
              <option value="day">Último dia</option>
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
            </select>
          </div>
        </div>
      )}

      {/* Rest of component remains the same... */}
      {/* Commits List */}
      {loading && commits.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Carregando commits...</p>
          </div>
        </div>
      ) : filteredCommits.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              {filteredCommits.length} commits encontrados
            </h2>
            <div className="text-sm text-slate-400">
              Repositório: <span className="text-blue-400 font-medium">{selectedRepo}</span>
              {selectedBranch && (
                <span> • Branch: <span className="text-green-400 font-medium">{selectedBranch}</span></span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {filteredCommits.map((commit) => {
              const stats = getCommitStats(commit);
              
              return (
                <div key={commit.sha} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-300/50 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {commit.author ? (
                        <img
                          src={commit.author.avatar_url}
                          alt={commit.author.login}
                          className="w-12 h-12 rounded-full border-2 border-slate-600"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Commit Info */}
                    <div className="flex-1 min-w-0">
                      {/* Commit Message */}
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-white mb-1 break-words">
                          {commit.commit.message.split('\n')[0]}
                        </h3>
                        {commit.commit.message.split('\n').length > 1 && (
                          <div className="text-slate-400 text-sm mt-2 whitespace-pre-wrap">
                            {commit.commit.message.split('\n').slice(1).join('\n').trim()}
                          </div>
                        )}
                      </div>

                      {/* Commit Meta */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-300 font-medium">
                              {commit.commit.author.name}
                            </span>
                            {commit.author && (
                              <span className="text-slate-500">
                                (@{commit.author.login})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Calendar className="w-4 h-4 text-green-400" />
                            <span>{formatDateTime(commit.commit.author.date)}</span>
                            <span className="text-blue-400">({getTimeAgo(commit.commit.author.date)})</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Hash className="w-4 h-4 text-purple-400" />
                            <code className="bg-slate-700 px-2 py-1 rounded text-xs font-mono text-slate-300">
                              {commit.sha.substring(0, 8)}
                            </code>
                            <a
                              href={commit.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          
                          {stats && (
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-green-400">
                                <Plus className="w-3 h-3" />
                                <span>{stats.additions}</span>
                              </div>
                              <div className="flex items-center gap-1 text-red-400">
                                <Minus className="w-3 h-3" />
                                <span>{stats.deletions}</span>
                              </div>
                              <div className="text-slate-400">
                                Total: {stats.total}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Committer Info (se diferente do author) */}
                      {commit.commit.committer.email !== commit.commit.author.email && (
                        <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <GitCommit className="w-4 h-4 text-orange-400" />
                            <span>Committed by: </span>
                            <span className="text-slate-300 font-medium">
                              {commit.commit.committer.name}
                            </span>
                            <span className="text-slate-500">
                              em {formatDateTime(commit.commit.committer.date)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : selectedRepo ? (
        <div className="text-center py-12">
          <GitCommit className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Nenhum commit encontrado</h3>
          <p className="text-slate-500">
            {searchTerm ? 'Tente ajustar os filtros de busca' : 'Este repositório não possui commits no branch selecionado'}
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <GitCommit className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Selecione um repositório</h3>
          <p className="text-slate-500">Escolha um repositório para visualizar o histórico de commits</p>
        </div>
      )}
    </div>
  );
};

export default CommitHistory;
