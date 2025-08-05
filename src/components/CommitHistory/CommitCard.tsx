// src/components/CommitHistory/CommitCard.tsx - Layout Melhorado
import React from 'react';
import {
  User, Calendar, Clock, Hash, Plus, Minus, ExternalLink,
  GitCommit, MessageSquare, FileText, Code, TrendingUp,
  Tag, Globe, Sparkles, Bug, BookOpen, Paintbrush,
  RefreshCw, TestTube, Settings
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
      minute: '2-digit'
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

  const getCommitTypeConfig = (type: CommitType | undefined) => {
    const configs = {
      feat: { bg: 'bg-green-500', label: 'FEAT', icon: Sparkles },
      fix: { bg: 'bg-red-500', label: 'FIX', icon: Bug },
      docs: { bg: 'bg-blue-500', label: 'DOCS', icon: BookOpen },
      style: { bg: 'bg-purple-500', label: 'STYLE', icon: Paintbrush },
      refactor: { bg: 'bg-yellow-500', label: 'REFACTOR', icon: RefreshCw },
      test: { bg: 'bg-orange-500', label: 'TEST', icon: TestTube },
      chore: { bg: 'bg-gray-500', label: 'CHORE', icon: Settings },
      other: { bg: 'bg-slate-500', label: 'OTHER', icon: FileText }
    };
    return configs[type || 'other'];
  };

  const typeConfig = getCommitTypeConfig(commit.commitType);
  const TypeIcon = typeConfig.icon;

  return (
    <div className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
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
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white ${typeConfig.bg}`}>
                    <TypeIcon className="w-3 h-3" />
                    {typeConfig.label}
                  </span>
                  
                  {showRepository && commit.repository && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-600/80 text-white">
                      <Globe className="w-3 h-3" />
                      {commit.repository.name}
                    </span>
                  )}
                </div>

                {/* Commit Message */}
                <h3 className="text-lg font-semibold text-white mb-2 break-words group-hover:text-blue-400 transition-colors leading-tight">
                  {commit.commit.message.split('\n')[0]}
                </h3>
                
                {/* Extended message */}
                {commit.commit.message.split('\n').length > 1 && (
                  <div className="text-slate-400 text-sm mt-2 whitespace-pre-wrap max-h-20 overflow-y-auto bg-slate-700/30 rounded-lg p-3">
                    {commit.commit.message.split('\n').slice(1).join('\n').trim()}
                  </div>
                )}
              </div>

              {/* External Link */}
              <a
                href={commit.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-400 transition-colors flex-shrink-0"
                title="Ver no GitHub"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="px-6 pb-4">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">{stats.additions}</span>
                  <span className="text-slate-400">adições</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Minus className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">{stats.deletions}</span>
                  <span className="text-slate-400">remoções</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium">{stats.total}</span>
                  <span className="text-slate-400">total</span>
                </div>
              </div>

              {/* Impact indicator */}
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-medium text-orange-400">
                  {stats.total > 100 ? 'Alto Impacto' : stats.total > 20 ? 'Médio Impacto' : 'Baixo Impacto'}
                </span>
              </div>
            </div>

            {/* Progress bar for changes */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="flex h-2">
                <div 
                  className="bg-green-500 transition-all duration-500" 
                  style={{ width: `${(stats.additions / stats.total) * 100}%` }}
                />
                <div 
                  className="bg-red-500 transition-all duration-500" 
                  style={{ width: `${(stats.deletions / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meta Information */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Author & Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300 font-medium">
                {commit.commit.author.name}
              </span>
              {commit.author && (
                <span className="text-slate-500 text-xs">
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

          {/* Technical Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4 text-purple-400" />
              <code className="bg-slate-700 px-2 py-1 rounded text-xs font-mono text-slate-300">
                {commit.sha.substring(0, 8)}
              </code>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <MessageSquare className="w-4 h-4 text-orange-400" />
              <span>{commit.messageLength} caracteres</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>{commit.dayOfWeek}</span>
              <span className="text-slate-600">•</span>
              <Clock className="w-4 h-4 text-pink-400" />
              <span>{commit.timeOfDay}:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Committer Info (if different from author) */}
      {commit.commit.committer.email !== commit.commit.author.email && (
        <div className="px-6 pb-4">
          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <GitCommit className="w-4 h-4 text-orange-400" />
              <span>Committed by:</span>
              <span className="text-slate-300 font-medium">
                {commit.commit.committer.name}
              </span>
              <span className="text-slate-500">
                em {formatDateTime(commit.commit.committer.date)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Metrics Footer */}
      <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            {commit.filesChanged && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {commit.filesChanged} arquivos
              </span>
            )}
            {commit.linesChanged && (
              <span className="flex items-center gap-1">
                <Code className="w-3 h-3" />
                {commit.linesChanged} linhas alteradas
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>ID: {commit.sha.substring(0, 7)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitCard;
