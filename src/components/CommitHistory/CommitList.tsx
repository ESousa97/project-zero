// src/components/CommitHistory/CommitList.tsx
import React from 'react';
import CommitCard from './CommitCard';
import type { ExtendedCommit } from './types';
import type { Commit } from '../../types/github';

interface CommitListProps {
  commits: ExtendedCommit[];
  selectedRepo: string;
  selectedBranch: string;
  allReposCommits: Commit[];
}

const CommitList: React.FC<CommitListProps> = ({
  commits,
  selectedRepo,
  selectedBranch,
  allReposCommits
}) => {
  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          {commits.length} commits encontrados
        </h2>
        <div className="text-sm text-slate-400">
          {selectedRepo === 'all' ? (
            <span>
              Fonte: <span className="text-purple-400 font-medium">Múltiplos repositórios</span>
              <span className="text-slate-500"> • {allReposCommits.length} commits totais coletados</span>
            </span>
          ) : (
            <>
              Repositório: <span className="text-blue-400 font-medium">{selectedRepo}</span>
              {selectedBranch && (
                <span> • Branch: <span className="text-green-400 font-medium">{selectedBranch}</span></span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Commits List */}
      <div className="space-y-4">
        {commits.map((commit) => (
          <CommitCard
            key={`${commit.sha}-${commit.repository?.full_name || selectedRepo}`}
            commit={commit}
            showRepository={selectedRepo === 'all'}
          />
        ))}
      </div>
    </div>
  );
};

export default CommitList;
