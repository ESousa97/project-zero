// src/components/CommitHistory/CommitHistoryHeader.tsx
import React from 'react';
import { GitCommit, BarChart3, List, Clock } from 'lucide-react';
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
  const viewModes: readonly ViewMode[] = ['list', 'timeline', 'analytics'];

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <GitCommit className="w-10 h-10 text-green-500" aria-hidden="true" />
          Histórico de Commits Detalhado
        </h1>
        <p className="text-slate-400">
          Análise completa de commits com métricas avançadas e visualizações interativas
        </p>
        {totalCommits > 0 && (
          <p className="text-slate-500 text-sm mt-1" aria-live="polite">
            {totalCommits} commits encontrados em {totalRepositories} repositórios
          </p>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex bg-slate-800 rounded-lg p-1">
        {viewModes.map((mode) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              viewMode === mode
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            aria-pressed={viewMode === mode}
            aria-label={`Visualização ${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
            type="button"
          >
            {mode === 'list' && (
              <>
                <List className="w-4 h-4 inline mr-2" aria-hidden="true" />
                Lista
              </>
            )}
            {mode === 'timeline' && (
              <>
                <Clock className="w-4 h-4 inline mr-2" aria-hidden="true" />
                Timeline
              </>
            )}
            {mode === 'analytics' && (
              <>
                <BarChart3 className="w-4 h-4 inline mr-2" aria-hidden="true" />
                Analytics
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommitHistoryHeader;
