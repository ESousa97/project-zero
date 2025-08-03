// src/components/CommitHistory/CommitTimeline.tsx - Layout Melhorado
import React from 'react';
import { GitCommit, User, Plus, Minus, ExternalLink, Activity, Calendar, Hash, Globe } from 'lucide-react';
import type { ExtendedCommit, CommitType } from './types';

interface CommitTimelineProps {
  commits: ExtendedCommit[];
}

const CommitTimeline: React.FC<CommitTimelineProps> = ({ commits }) => {
  // Utility functions
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
      feat: { bg: 'bg-green-500', border: 'border-green-400', text: 'text-green-400', label: 'FEAT' },
      fix: { bg: 'bg-red-500', border: 'border-red-400', text: 'text-red-400', label: 'FIX' },
      docs: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-blue-400', label: 'DOCS' },
      style: { bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-purple-400', label: 'STYLE' },
      refactor: { bg: 'bg-yellow-500', border: 'border-yellow-400', text: 'text-yellow-400', label: 'REFACTOR' },
      test: { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-orange-400', label: 'TEST' },
      chore: { bg: 'bg-gray-500', border: 'border-gray-400', text: 'text-gray-400', label: 'CHORE' },
      other: { bg: 'bg-slate-500', border: 'border-slate-400', text: 'text-slate-400', label: 'OTHER' }
    };
    return configs[type || 'other'];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">
              Timeline de Commits
            </h3>
            <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-sm font-medium">
              {commits.length} commits
            </span>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-slate-400">Features</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-slate-400">Fixes</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-slate-400">Docs</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              <span className="text-slate-400">Outros</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-slate-600"></div>
        
        <div className="space-y-6">
          {commits.map((commit, _index) => {
            const typeConfig = getCommitTypeConfig(commit.commitType);
            
            return (
              <div key={commit.sha} className="relative flex items-start gap-6">
                {/* Timeline Dot */}
                <div className={`relative z-10 w-16 h-16 rounded-full border-4 border-slate-800 ${typeConfig.bg} flex items-center justify-center shadow-lg`}>
                  <GitCommit className="w-6 h-6 text-white" />
                  {/* Type Badge */}
                  <div className={`absolute -top-1 -right-1 w-6 h-6 ${typeConfig.bg} rounded-full border-2 border-slate-800 flex items-center justify-center`}>
                    <span className="text-xs font-bold text-white">
                      {typeConfig.label.charAt(0)}
                    </span>
                  </div>
                </div>
                
                {/* Timeline Content */}
                <div className="flex-1 bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header with badges and time */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${typeConfig.bg}`}>
                          {typeConfig.label}
                        </span>
                        
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(commit.commit.author.date)}</span>
                          <span>•</span>
                          <span>{getTimeAgo(commit.commit.author.date)}</span>
                        </div>

                        {commit.repository && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                            <Globe className="w-3 h-3" />
                            {commit.repository.name}
                          </span>
                        )}
                      </div>
                      
                      {/* Commit Message */}
                      <h4 className="font-semibold text-white mb-2 text-lg hover:text-blue-400 transition-colors leading-tight">
                        {commit.commit.message.split('\n')[0]}
                      </h4>
                      
                      {/* Extended message preview */}
                      {commit.commit.message.split('\n').length > 1 && (
                        <div className="text-slate-400 text-sm mb-4 bg-slate-700/30 rounded-lg p-3 max-h-16 overflow-hidden">
                          {commit.commit.message.split('\n').slice(1).join('\n').trim()}
                        </div>
                      )}
                      
                      {/* Commit Meta */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-3 text-sm">
                          <User className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-300 font-medium">
                            {commit.commit.author.name}
                          </span>
                          {commit.author && (
                            <span className="text-slate-500 text-xs">
                              @{commit.author.login}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <Hash className="w-4 h-4 text-purple-400" />
                          <code className="bg-slate-700 px-2 py-1 rounded text-xs font-mono text-slate-300">
                            {commit.sha.substring(0, 8)}
                          </code>
                        </div>
                      </div>

                      {/* Stats */}
                      {commit.stats && (
                        <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-6 text-sm mb-2">
                            <div className="flex items-center gap-2">
                              <Plus className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 font-medium">{commit.stats.additions}</span>
                              <span className="text-slate-400">adições</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Minus className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 font-medium">{commit.stats.deletions}</span>
                              <span className="text-slate-400">remoções</span>
                            </div>
                            <div className="text-slate-400">
                              <span className="font-medium text-white">{commit.stats.total}</span> total
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {commit.stats.total > 0 && (
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div className="flex h-2">
                                <div 
                                  className="bg-green-500 transition-all duration-500" 
                                  style={{ width: `${(commit.stats.additions / commit.stats.total) * 100}%` }}
                                />
                                <div 
                                  className="bg-red-500 transition-all duration-500" 
                                  style={{ width: `${(commit.stats.deletions / commit.stats.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Additional metrics */}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {commit.filesChanged && (
                          <span>{commit.filesChanged} arquivos alterados</span>
                        )}
                        {commit.linesChanged && (
                          <span>{commit.linesChanged} linhas modificadas</span>
                        )}
                        {commit.messageLength && (
                          <span>{commit.messageLength} caracteres</span>
                        )}
                        {commit.dayOfWeek && (
                          <span>{commit.dayOfWeek}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* External Link */}
                    <a
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-blue-400 transition-colors flex-shrink-0 p-2 hover:bg-slate-700/50 rounded-lg"
                      title="Ver commit no GitHub"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline ending indicator */}
        <div className="relative flex items-center justify-center mt-8">
          <div className="w-12 h-12 bg-slate-700 rounded-full border-4 border-slate-800 flex items-center justify-center">
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="bg-slate-700/20 rounded-lg p-4 border border-slate-600/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Timeline exibindo os {commits.length} commits mais recentes
          </span>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500">
              De {commits.length > 0 ? formatDate(commits[commits.length - 1].commit.author.date) : ''} 
              até {commits.length > 0 ? formatDate(commits[0].commit.author.date) : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitTimeline;
