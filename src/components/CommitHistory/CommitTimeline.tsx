// src/components/CommitHistory/CommitTimeline.tsx
import React from 'react';
import { GitCommit, User, Plus, Minus, ExternalLink, Activity } from 'lucide-react';
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
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-blue-400" />
        Timeline de Commits ({commits.length} commits)
      </h3>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-600"></div>
        
        <div className="space-y-6">
          {commits.map((commit) => (
            <div key={commit.sha} className="relative flex items-start space-x-4">
              {/* Timeline Dot */}
              <div className={`relative z-10 w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center ${getCommitTypeColor(commit.commitType)}`}>
                <GitCommit className="w-5 h-5 text-white" />
              </div>
              
              {/* Timeline Content */}
              <div className="flex-1 bg-slate-700/30 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getCommitTypeColor(commit.commitType)}`}>
                        {getCommitTypeLabel(commit.commitType)}
                      </span>
                      <span className="text-slate-400 text-sm">
                        {getTimeAgo(commit.commit.author.date)}
                      </span>
                      {commit.repository && (
                        <span className="text-indigo-400 text-sm">
                          📦 {commit.repository.name}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-white mb-1 hover:text-blue-400 transition-colors">
                      {commit.commit.message.split('\n')[0]}
                    </h4>
                    
                    {/* Extended message preview */}
                    {commit.commit.message.split('\n').length > 1 && (
                      <div className="text-slate-400 text-sm mb-3 max-h-16 overflow-hidden">
                        {commit.commit.message.split('\n').slice(1).join('\n').trim()}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {commit.commit.author.name}
                      </span>
                      
                      {commit.stats && (
                        <>
                          <span className="flex items-center gap-1 text-green-400">
                            <Plus className="w-3 h-3" />
                            {commit.stats.additions}
                          </span>
                          <span className="flex items-center gap-1 text-red-400">
                            <Minus className="w-3 h-3" />
                            {commit.stats.deletions}
                          </span>
                        </>
                      )}
                      
                      <code className="bg-slate-700 px-2 py-1 rounded text-xs font-mono">
                        {commit.sha.substring(0, 8)}
                      </code>
                    </div>

                    {/* Progress Bar for Changes */}
                    {commit.stats && commit.stats.total > 0 && (
                      <div className="w-full bg-slate-600 rounded-full h-1.5 mb-2">
                        <div className="flex h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-green-500" 
                            style={{ width: `${(commit.stats.additions / commit.stats.total) * 100}%` }}
                          />
                          <div 
                            className="bg-red-500" 
                            style={{ width: `${(commit.stats.deletions / commit.stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Additional metrics */}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {commit.filesChanged && (
                        <span>{commit.filesChanged} arquivos</span>
                      )}
                      {commit.linesChanged && (
                        <span>{commit.linesChanged} linhas</span>
                      )}
                      {commit.messageLength && (
                        <span>{commit.messageLength} chars</span>
                      )}
                      {commit.dayOfWeek && (
                        <span>{commit.dayOfWeek}</span>
                      )}
                    </div>
                  </div>
                  
                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors ml-4 flex-shrink-0"
                    title="Ver commit no GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline ending indicator */}
        <div className="relative flex items-center justify-center mt-6">
          <div className="w-12 h-12 bg-slate-700 rounded-full border-4 border-slate-800 flex items-center justify-center">
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Timeline summary */}
      <div className="mt-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Timeline mostrando os {commits.length} commits mais recentes
          </span>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Features
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              Fixes
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Docs
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <div className="w-2 h-2 bg-slate-500 rounded-full" />
              Outros
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitTimeline;
