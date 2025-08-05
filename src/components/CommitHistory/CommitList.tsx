// src/components/CommitHistory/CommitList.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, Filter, Info, Zap } from 'lucide-react';
import CommitCard from './CommitCard';
import type { ExtendedCommit } from './types';
import type { Commit } from '../../types/github';

interface CommitListProps {
  commits: ExtendedCommit[]; // Sempre limitado a 10 commits
  selectedRepo: string;
  selectedBranch: string;
  allReposCommits: Commit[];
  totalFilteredCount: number; // Total de commits que correspondem aos filtros
  isFiltered: boolean;
}

const CommitList: React.FC<CommitListProps> = ({
  commits,
  selectedRepo,
  selectedBranch,
  allReposCommits,
  totalFilteredCount,
  isFiltered
}) => {
  const [compactView, setCompactView] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header com Info e Controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-700/50">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            Commits Encontrados
            {isFiltered && (
              <span className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                <Filter className="w-3 h-3" aria-hidden="true" />
                Filtrado
              </span>
            )}
          </h2>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            {selectedRepo === 'all' ? (
              <>
                <span className="inline-flex items-center gap-1 bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                  Múltiplos repositórios
                </span>
                <span aria-hidden="true">•</span>
                <span>{allReposCommits.length} commits coletados no total</span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                  {selectedRepo}
                </span>
                {selectedBranch && (
                  <>
                    <span aria-hidden="true">•</span>
                    <span className="inline-flex items-center gap-1 bg-green-600/20 text-green-400 px-2 py-1 rounded">
                      Branch: {selectedBranch}
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          {/* Informação sobre limitação da lista */}
          {totalFilteredCount > 10 && (
            <div className="mt-2 p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="text-sm">
                  <p className="text-blue-400 font-medium">Lista Otimizada</p>
                  <p className="text-slate-300">
                    Exibindo os <strong>10 commits mais relevantes</strong> de um total de{' '}
                    <strong>{totalFilteredCount} commits</strong> que correspondem aos filtros.
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Para análise completa de todos os {totalFilteredCount} commits, use a visualização Analytics.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controles de Visualização */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCompactView(!compactView)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all duration-200 border border-slate-600"
            type="button"
            aria-pressed={compactView}
            aria-label={compactView ? 'Expandir visualização compacta' : 'Compactar visualização detalhada'}
          >
            {compactView ? <Eye className="w-4 h-4" aria-hidden="true" /> : <EyeOff className="w-4 h-4" aria-hidden="true" />}
            <span className="text-sm">{compactView ? 'Expandir' : 'Compactar'}</span>
          </button>

          {/* Indicador da limitação da lista */}
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
            <span className="text-blue-400 text-sm font-medium" aria-live="polite">
              Top {commits.length}
            </span>
            {totalFilteredCount > commits.length && (
              <span className="text-blue-300 text-xs" aria-live="polite">
                de {totalFilteredCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Commits */}
      {commits.length > 0 ? (
        <div className={compactView ? 'space-y-2' : 'space-y-4'}>
          {commits.map((commit, index) => (
            <div
              key={`${commit.sha}-${commit.repository?.full_name || selectedRepo}`}
              className={`transition-all duration-300 ${compactView ? 'opacity-90 hover:opacity-100' : ''}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CommitCard commit={commit} showRepository={selectedRepo === 'all'} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-slate-400">
            <Filter className="w-12 h-12 mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-lg font-semibold mb-2">Nenhum commit na lista</h3>
            <p className="text-sm">
              {isFiltered
                ? 'Os filtros aplicados não retornaram commits para exibição'
                : 'Carregue commits de um repositório para visualizar'}
            </p>
          </div>
        </div>
      )}

      {/* Informações adicionais sobre limitação */}
      {commits.length > 0 && totalFilteredCount > 10 && (
        <div className="bg-slate-700/20 rounded-lg p-4 border border-slate-600/50">
          <div className="text-center">
            <h4 className="text-slate-300 font-medium mb-2">Lista Otimizada</h4>
            <p className="text-slate-400 text-sm mb-3">
              Esta lista mostra apenas os <strong>10 commits mais relevantes</strong> de acordo com os filtros aplicados.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{commits.length}</div>
                <div className="text-xs text-slate-400">Exibidos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{totalFilteredCount}</div>
                <div className="text-xs text-slate-400">Total Filtrados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {[...new Set(commits.map(c => c.commit.author.name))].length}
                </div>
                <div className="text-xs text-slate-400">Autores</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">
                  {commits.reduce((sum, c) => sum + (c.stats?.additions || 0), 0)}
                </div>
                <div className="text-xs text-slate-400">Linhas +</div>
              </div>
            </div>

            {totalFilteredCount > commits.length && (
              <div className="mt-4 p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <Zap className="inline w-4 h-4 mr-1 align-text-bottom" aria-hidden="true" />
                  <strong>Dica:</strong> Para analisar todos os {totalFilteredCount} commits filtrados, use a visualização <strong>Analytics</strong> que processa o conjunto completo de dados.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Aviso de performance */}
      {totalFilteredCount > 1000 && (
        <div className="bg-yellow-600/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Zap className="text-yellow-400 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="text-yellow-400 font-medium mb-1">Otimização de Performance</h4>
              <p className="text-yellow-300/80 text-sm">
                Com {totalFilteredCount} commits encontrados, a lista exibe apenas os 10 mais relevantes para garantir uma experiência fluida. Utilize filtros mais específicos ou a visualização Analytics para análises detalhadas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitList;
