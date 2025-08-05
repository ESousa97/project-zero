// src/components/CommitHistory/hooks/useCommitFilters.ts
import { useState, useCallback, useMemo } from 'react';
import type { ExtendedCommit, CommitFiltersState, CommitType } from '../types';
import { getTimeFilterMilliseconds } from '../types';
import type { Commit } from '../../../types/github';

// Estado inicial dos filtros
const initialFilters: CommitFiltersState = {
  searchTerm: '',
  timeFilter: 'all',
  sortBy: 'date',
  selectedAuthor: 'all',
  selectedRepo: '',
  selectedBranch: 'main'
};

/**
 * Hook para gerenciar filtros e processamento dos commits
 * @param commits Array de commits crus do GitHub
 * @returns Estado e funções para filtros e commits filtrados
 */
export const useCommitFilters = (commits: Commit[]) => {
  const [filters, setFilters] = useState<CommitFiltersState>(initialFilters);

  /**
   * Processa commits com informações estendidas e categorização
   * Substitua os comentários de emojis por ícones Lucide no componente de UI
   */
  const extendedCommits: ExtendedCommit[] = useMemo(() => {
    // console.log removido
    if (!commits.length) return [];

    return commits.map(commit => {
      const message = commit.commit.message;
      const date = new Date(commit.commit.author.date);

      // Determina o tipo de commit pela mensagem
      let commitType: CommitType = 'other';
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.startsWith('feat')) commitType = 'feat';
      else if (lowerMessage.startsWith('fix')) commitType = 'fix';
      else if (lowerMessage.startsWith('docs')) commitType = 'docs';
      else if (lowerMessage.startsWith('style')) commitType = 'style';
      else if (lowerMessage.startsWith('refactor')) commitType = 'refactor';
      else if (lowerMessage.startsWith('test')) commitType = 'test';
      else if (lowerMessage.startsWith('chore')) commitType = 'chore';

      // Normaliza autor do commit (sempre definido)
      const normalizedCommitAuthor = {
        name: commit.commit.author?.name || 'Unknown',
        email: commit.commit.author?.email || 'unknown@email.com',
        date: commit.commit.author?.date || new Date().toISOString()
      };

      // Normaliza committer do commit (sempre definido)
      const normalizedCommitCommitter = {
        name: commit.commit.committer?.name || normalizedCommitAuthor.name,
        email: commit.commit.committer?.email || normalizedCommitAuthor.email,
        date: commit.commit.committer?.date || normalizedCommitAuthor.date
      };

      return {
        ...commit,
        author: commit.author
          ? {
              login: commit.author.login,
              avatar_url: commit.author.avatar_url
            }
          : undefined,
        commit: {
          ...commit.commit,
          author: normalizedCommitAuthor,
          committer: normalizedCommitCommitter
        },
        commitType,
        messageLength: message.length,
        dayOfWeek: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
        timeOfDay: date.getHours(),
        filesChanged: commit.stats?.total || 0,
        linesChanged: (commit.stats?.additions || 0) + (commit.stats?.deletions || 0)
      };
    });
  }, [commits]);

  /**
   * Aplica os filtros ao conjunto de commits estendidos
   */
  const filteredCommits = useMemo(() => {
    if (!commits.length) {
      // console.log removido
      return [];
    }

    let filtered = [...extendedCommits];

    // 1. Filtro de busca por termo
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(commit =>
        commit.commit.message.toLowerCase().includes(searchTerm) ||
        commit.commit.author.name.toLowerCase().includes(searchTerm) ||
        commit.sha.toLowerCase().includes(searchTerm) ||
        (commit.author?.login || '').toLowerCase().includes(searchTerm)
      );
    }

    // 2. Filtro por autor específico
    if (filters.selectedAuthor !== 'all') {
      filtered = filtered.filter(commit => commit.commit.author.name === filters.selectedAuthor);
    }

    // 3. Filtro por período de tempo
    if (filters.timeFilter !== 'all') {
      const filterMilliseconds = getTimeFilterMilliseconds(filters.timeFilter);

      if (filterMilliseconds) {
        const now = Date.now();
        const cutoffTime = now - filterMilliseconds;

        filtered = filtered.filter(commit => {
          try {
            const commitTime = new Date(commit.commit.author.date).getTime();
            return commitTime >= cutoffTime;
          } catch {
            // Ignora commits com data inválida
            return false;
          }
        });
      }
    }

    // 4. Ordenação conforme filtro
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime();
        case 'author':
          return a.commit.author.name.localeCompare(b.commit.author.name);
        case 'additions':
          return (b.stats?.additions || 0) - (a.stats?.additions || 0);
        case 'deletions':
          return (b.stats?.deletions || 0) - (a.stats?.deletions || 0);
        case 'changes':
          return (b.linesChanged || 0) - (a.linesChanged || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [extendedCommits, filters, commits.length]);

  // Lista limitada para exibição (top 10)
  const limitedCommitsForList = useMemo(() => {
    return filteredCommits.slice(0, 10);
  }, [filteredCommits]);

  // Todos os commits filtrados para análise (sem limite)
  const allFilteredCommitsForAnalytics = useMemo(() => filteredCommits, [filteredCommits]);

  // Lista de autores únicos dos commits filtrados, ordenados alfabeticamente
  const uniqueAuthors = useMemo(() => {
    return [...new Set(filteredCommits.map(commit => commit.commit.author.name))]
      .filter(name => name !== '')
      .sort();
  }, [filteredCommits]);

  // Atualiza um filtro específico
  const updateFilter = useCallback((key: keyof CommitFiltersState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Reseta filtros, preservando repo e branch selecionados
  const resetFilters = useCallback(() => {
    setFilters(prev => ({
      ...initialFilters,
      selectedRepo: prev.selectedRepo,
      selectedBranch: prev.selectedBranch
    }));
  }, []);

  return {
    filters,
    extendedCommits,
    filteredCommits,
    limitedCommitsForList,          // Top 10 para lista
    allFilteredCommitsForAnalytics, // Todos para analytics
    uniqueAuthors,
    updateFilter,
    resetFilters,
    totalFilteredCount: filteredCommits.length,
    totalCommitsCount: extendedCommits.length,
    isFiltered:
      filters.searchTerm !== '' ||
      filters.selectedAuthor !== 'all' ||
      filters.timeFilter !== 'all' ||
      filters.sortBy !== 'date'
  };
};
