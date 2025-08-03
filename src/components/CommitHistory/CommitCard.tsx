// src/components/CommitHistory/CommitCard.tsx
import React from 'react';
import {
  User, Calendar, Clock, Hash, Plus, Minus, ExternalLink,
  GitCommit, MessageSquare, FileText, Code, TrendingUp
} from 'lucide-react';
import type { ExtendedCommit, CommitType } from './types';

interface CommitCardProps {
  commit: ExtendedCommit;
  showRepository?: boolean;
}

const CommitCard: React.FC<CommitCardProps> = ({ commit, showRepository = false }) => {
  const stats = commit.stats;

  // Utility functions
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
    return `${Math.floor(diffInSeconds / 2592000)}m atrás`;
  };

  const getCommitTypeColor = (type: CommitType | undefined) => {
    const colors = {
      feat: 'bg-green-500',
      fix: 'bg-red-500',
      docs: 'bg-blue-500',
      style: 'bg-purple-500',
      refactor: 'bg-yellow-500',
      test: 'bg-orange-500',
      chore: 'bg-gray-500',
      other: 'bg-slate-500'
    };
    return colors[type || 'other'];
  };

  const getCommitTypeLabel = (type: CommitType | undefined) => {
    const labels = {
      feat: 'FEAT',
      fix: 'FIX',
      docs: 'DOCS',
      style: 'STYLE',
      refactor: 'REFACTOR',
      test: 'TEST',
      chore: 'CHORE',
      other: 'OTHER'
    };
    return labels[type || 'other'];
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-300/50 transition-all duration-300 group">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {commit.author ? (
            <img
              src={commit.author.avatar_url}
              alt={commit.author.login}
              className="w-12 h-12 rounded-full border-2 border-slate-600 group-hover:border-blue-500 transition-colors"
            />
          ) : (
            <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-slate-400" />
            </div>
          )}
        </div>

        {/* Commit Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getCommitTypeColor(commit.commitType)}`}>
              {getCommitTypeLabel(commit.commitType)}
            </span>
            {/* Repository Badge */}
            {showRepository && commit.repository && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white">
                📦 {commit.repository.name}
              </span>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1 break-words group-hover:text-blue-400 transition-colors">
                {commit.commit.message.split('\n')[0]}
              </h3>
              {commit.commit.message.split('\n').length > 1 && (
                <div className="text-slate-400 text-sm mt-2 whitespace-pre-wrap max-h-20 overflow-y-auto">
                  {commit.commit.message.split('\n').slice(1).join('\n').trim()}
                </div>
              )}
            </div>
          </div>

          {/* Commit Meta Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Author Info */}
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
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <Clock className="w-4 h-4" />
                <span>{getTimeAgo(commit.commit.author.date)}</span>
              </div>
            </div>

            {/* Commit Details */}
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
                <>
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
                  
                  {/* Progress bar for changes */}
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(stats.additions / stats.total) * 100}%` }}
                      />
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(stats.deletions / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Additional Metrics */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MessageSquare className="w-4 h-4 text-orange-400" />
                <span>{commit.messageLength} caracteres</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>{commit.dayOfWeek}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4 text-pink-400" />
                <span>{commit.timeOfDay}:00</span>
              </div>
            </div>
          </div>

          {/* Committer Info (if different from author) */}
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

          {/* Advanced Metrics */}
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {commit.filesChanged || 0} arquivos
            </span>
            <span className="flex items-center gap-1">
              <Code className="w-3 h-3" />
              {commit.linesChanged || 0} linhas alteradas
            </span>
            {commit.stats && (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Impacto: {commit.stats.total > 100 ? 'Alto' : commit.stats.total > 20 ? 'Médio' : 'Baixo'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitCard;
