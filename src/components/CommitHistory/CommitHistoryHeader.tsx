// src/components/CommitHistory/CommitHistoryHeader.tsx
import React from 'react';
import { GitCommit } from 'lucide-react';
import type { ViewMode } from './types';

interface CommitHistoryHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalCommits: number;
  totalRepositories: number;
}

const CommitHistoryHeader: React.FC<CommitHistoryHeaderProps> = ({
  viewMode,
  onViewModeChange,
  totalCommits,
  totalRepositories
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <GitCommit className="w-10 h-10 text-green-500" />
          Histórico de Commits Detalhado
        </h1>
        <p className="text-slate-400">
          Análise completa de commits com métricas avançadas e visualizações interativas
        </p>
        {totalCommits > 0 && (
          <p className="text-slate-500 text-sm mt-1">
            {totalCommits} commits encontrados em {totalRepositories} repositórios
          </p>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex bg-slate-800 rounded-lg p-1">
        {(['list', 'timeline', 'analytics'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === mode
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {mode === 'list' && 'Lista'}
            {mode === 'timeline' && 'Timeline'}
            {mode === 'analytics' && 'Analytics'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommitHistoryHeader;
