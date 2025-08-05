// src/components/CommitHistory/CommitTimeline.tsx
import React from 'react';
import {
  GitCommit,
  User,
  Plus,
  Minus,
  ExternalLink,
  Activity,
  Calendar,
  Hash,
  Globe,
} from 'lucide-react';
import type { ExtendedCommit, CommitType } from './types';

interface CommitTimelineProps {
  commits: ExtendedCommit[];
}

const CommitTimeline: React.FC<CommitTimelineProps> = ({ commits }) => {
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
      feat: { bg: 'bg-green-500', label: 'FEAT' },
      fix: { bg: 'bg-red-500', label: 'FIX' },
      docs: { bg: 'bg-blue-500', label: 'DOCS' },
      style: { bg: 'bg-purple-500', label: 'STYLE' },
      refactor: { bg: 'bg-yellow-500', label: 'REFACTOR' },
      test: { bg: 'bg-orange-500', label: 'TEST' },
      chore: { bg: 'bg-gray-500', label: 'CHORE' },
      other: { bg: 'bg-slate-500', label: 'OTHER' },
    };
    return configs[type || 'other'];
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="space-y-6">
      {/* Header da timeline */}
      <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-blue-400" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-white">Timeline de Commits</h3>
          <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-sm font-medium">
            {commits.length} commits
          </span>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-3 text-xs">
          {[
            { color: 'bg-green-500', label: 'Features' },
            { color: 'bg-red-500', label: 'Fixes' },
            { color: 'bg-blue-500', label: 'Docs' },
            { color: 'bg-slate-500', label: 'Outros' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${color}`} aria-hidden="true" />
              <span className="text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdo da timeline - scroll e animação */}
      <div
        className="relative max-h-[600px] overflow-y-auto pr-4"
        style={{ scrollbarWidth: 'thin' }}
      >
        <style>
          {`
            /* Scrollbar styling for Webkit */
            ::-webkit-scrollbar {
              width: 8px;
            }
            ::-webkit-scrollbar-track {
              background: #1e293b; /* slate-800 */
            }
            ::-webkit-scrollbar-thumb {
              background-color: #3b82f6; /* blue-500 */
              border-radius: 4px;
            }
          `}
        </style>

        {/* Linha vertical */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-slate-600" />

        <div className="space-y-6">
          {commits.map((commit, index) => {
            const typeConfig = getCommitTypeConfig(commit.commitType);

            return (
              <div
                key={commit.sha}
                className="relative flex items-start gap-6
                  opacity-0 translate-y-4
                  animate-fade-slide-up
                "
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
              >
                {/* Bolinha da timeline */}
                <div
                  className={`relative z-10 w-16 h-16 rounded-full border-4 border-slate-800 ${typeConfig.bg} flex items-center justify-center shadow-lg`}
                  aria-label={`Tipo de commit: ${typeConfig.label}`}
                >
                  <GitCommit className="w-6 h-6 text-white" aria-hidden="true" />
                  {/* Badge do tipo */}
                  <div
                    className={`absolute -top-1 -right-1 w-6 h-6 ${typeConfig.bg} rounded-full border-2 border-slate-800 flex items-center justify-center`}
                  >
                    <span className="text-xs font-bold text-white">{typeConfig.label.charAt(0)}</span>
                  </div>
                </div>

                {/* Conteúdo do commit */}
                <div
                  className="flex-1 bg-slate-800/40 rounded-xl p-6 border border-slate-700/50
                  hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/20
                  transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Cabeçalho */}
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium text-white ${typeConfig.bg}`}
                          aria-label={`Tipo de commit: ${typeConfig.label}`}
                        >
                          {typeConfig.label}
                        </span>

                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" aria-hidden="true" />
                          <span>{formatDate(commit.commit.author.date)}</span>
                          <span aria-hidden="true">•</span>
                          <span>{getTimeAgo(commit.commit.author.date)}</span>
                        </div>

                        {commit.repository && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                            title={`Repositório: ${commit.repository.name}`}
                          >
                            <Globe className="w-3 h-3" aria-hidden="true" />
                            {commit.repository.name}
                          </span>
                        )}
                      </div>

                      {/* Mensagem */}
                      <h4 className="font-semibold text-white mb-2 text-lg hover:text-blue-400 transition-colors leading-tight">
                        {commit.commit.message.split('\n')[0]}
                      </h4>

                      {/* Preview mensagem extendida */}
                      {commit.commit.message.split('\n').length > 1 && (
                        <div className="text-slate-400 text-sm mb-4 bg-slate-700/30 rounded-lg p-3 max-h-16 overflow-hidden whitespace-pre-wrap">
                          {commit.commit.message.split('\n').slice(1).join('\n').trim()}
                        </div>
                      )}

                      {/* Meta info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-3 text-sm">
                          <User className="w-4 h-4 text-blue-400" aria-hidden="true" />
                          <span className="text-slate-300 font-medium">{commit.commit.author.name}</span>
                          {commit.author && (
                            <span className="text-slate-500 text-xs">@{commit.author.login}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <Hash className="w-4 h-4 text-purple-400" aria-hidden="true" />
                          <code className="bg-slate-700 px-2 py-1 rounded text-xs font-mono text-slate-300">
                            {commit.sha.substring(0, 8)}
                          </code>
                        </div>
                      </div>

                      {/* Estatísticas */}
                      {commit.stats && (
                        <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-6 text-sm mb-2">
                            <div className="flex items-center gap-2">
                              <Plus className="w-4 h-4 text-green-400" aria-hidden="true" />
                              <span className="text-green-400 font-medium">{commit.stats.additions}</span>
                              <span className="text-slate-400">adições</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Minus className="w-4 h-4 text-red-400" aria-hidden="true" />
                              <span className="text-red-400 font-medium">{commit.stats.deletions}</span>
                              <span className="text-slate-400">remoções</span>
                            </div>
                            <div className="text-slate-400">
                              <span className="font-medium text-white">{commit.stats.total}</span> total
                            </div>
                          </div>

                          {/* Barra de progresso */}
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

                      {/* Métricas adicionais */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        {commit.filesChanged !== undefined && (
                          <span>{commit.filesChanged} arquivos alterados</span>
                        )}
                        {commit.linesChanged !== undefined && (
                          <span>{commit.linesChanged} linhas modificadas</span>
                        )}
                        {commit.messageLength !== undefined && (
                          <span>{commit.messageLength} caracteres</span>
                        )}
                        {commit.dayOfWeek && <span>{commit.dayOfWeek}</span>}
                      </div>
                    </div>

                    {/* Link externo */}
                    <a
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-blue-400 transition-colors flex-shrink-0 p-2 hover:bg-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Ver commit no GitHub"
                      aria-label={`Ver commit ${commit.sha.substring(0, 8)} no GitHub`}
                    >
                      <ExternalLink className="w-5 h-5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicador final da timeline */}
        <div className="relative flex items-center justify-center mt-8">
          <div className="w-12 h-12 bg-slate-700 rounded-full border-4 border-slate-800 flex items-center justify-center">
            <Activity className="w-5 h-5 text-slate-400" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Resumo da timeline */}
      <div className="bg-slate-700/20 rounded-lg p-4 border border-slate-600/50">
        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
          <span className="text-slate-400">Timeline exibindo os {commits.length} commits mais recentes</span>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500">
              De {commits.length > 0 ? formatDate(commits[commits.length - 1].commit.author.date) : 'N/A'} até{' '}
              {commits.length > 0 ? formatDate(commits[0].commit.author.date) : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Animação keyframes */}
      <style>
        {`
          @keyframes fade-slide-up {
            0% {
              opacity: 0;
              transform: translateY(16px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-slide-up {
            animation-name: fade-slide-up;
            animation-timing-function: ease-out;
            animation-duration: 400ms;
          }
        `}
      </style>
    </div>
  );
};

export default CommitTimeline;
