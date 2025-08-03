// src/components/CommitHistory/CommitList.tsx - Layout Melhorado
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
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
  const [showAll, setShowAll] = useState(false);
  const [compactView, setCompactView] = useState(false);

  // Determinar quantos commits mostrar
  const initialDisplayCount = 20;
  const displayedCommits = showAll ? commits : commits.slice(0, initialDisplayCount);
  const hasMoreCommits = commits.length > initialDisplayCount;

  return (
    <div className="space-y-6">
      {/* Header with Info and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-700/50">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {commits.length} commit{commits.length !== 1 ? 's' : ''} encontrado{commits.length !== 1 ? 's' : ''}
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            {selectedRepo === 'all' ? (
              <>
                <span className="inline-flex items-center gap-1 bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                  Múltiplos repositórios
                </span>
                <span>•</span>
                <span>{allReposCommits.length} commits coletados no total</span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                  {selectedRepo}
                </span>
                {selectedBranch && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 bg-green-600/20 text-green-400 px-2 py-1 rounded">
                      Branch: {selectedBranch}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCompactView(!compactView)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all duration-200 border border-slate-600"
          >
            {compactView ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="text-sm">{compactView ? 'Expandir' : 'Compactar'}</span>
          </button>

          {hasMoreCommits && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-lg transition-all duration-200 border border-blue-500/30"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span className="text-sm">Mostrar menos</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span className="text-sm">Mostrar todos ({commits.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Commits Grid/List */}
      <div className={`space-y-4 ${compactView ? 'space-y-2' : 'space-y-4'}`}>
        {displayedCommits.map((commit, index) => (
          <div 
            key={`${commit.sha}-${commit.repository?.full_name || selectedRepo}`}
            className={`transition-all duration-300 ${
              compactView ? 'opacity-90 hover:opacity-100' : ''
            }`}
            style={{
              animationDelay: `${index * 50}ms`
            }}
          >
            <CommitCard
              commit={commit}
              showRepository={selectedRepo === 'all'}
            />
          </div>
        ))}
      </div>

      {/* Load More Section */}
      {hasMoreCommits && !showAll && (
        <div className="text-center py-6">
          <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/50">
            <p className="text-slate-400 mb-4">
              Mostrando {displayedCommits.length} de {commits.length} commits
            </p>
            <button
              onClick={() => setShowAll(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Carregar mais {commits.length - displayedCommits.length} commits
            </button>
          </div>
        </div>
      )}

      {/* Statistics Footer */}
      {commits.length > 0 && (
        <div className="bg-slate-700/20 rounded-lg p-4 border border-slate-600/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">
                {commits.length}
              </div>
              <div className="text-sm text-slate-400">Total Commits</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {commits.reduce((sum, c) => sum + (c.stats?.additions || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Linhas Adicionadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {commits.reduce((sum, c) => sum + (c.stats?.deletions || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Linhas Removidas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {[...new Set(commits.map(c => c.commit.author.name))].length}
              </div>
              <div className="text-sm text-slate-400">Autores Únicos</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tips */}
      {commits.length > 100 && (
        <div className="bg-yellow-600/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-400 mt-0.5">💡</div>
            <div>
              <h4 className="text-yellow-400 font-medium mb-1">Dica de Performance</h4>
              <p className="text-yellow-300/80 text-sm">
                Você tem {commits.length} commits carregados. Para melhor performance, 
                considere usar os filtros para refinar sua pesquisa ou ativar a visualização compacta.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitList;
