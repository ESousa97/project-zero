// =======================================================================
// src/components/CommitHistory/hooks/useCommitFilters.ts - CORRIGIDO
import { useState, useCallback, useMemo } from 'react';
import type { ExtendedCommit, CommitFiltersState, CommitType } from '../types';
import type { Commit } from '../../../types/github';

const initialFilters: CommitFiltersState = {
  searchTerm: '',
  timeFilter: 'all',
  sortBy: 'date',
  selectedAuthor: 'all',
  selectedRepo: '',
  selectedBranch: 'main'
};

export const useCommitFilters = (commits: Commit[]) => {
  const [filters, setFilters] = useState<CommitFiltersState>(initialFilters);

  // Processar commits com informações estendidas
  const extendedCommits: ExtendedCommit[] = useMemo(() => {
    if (!commits.length) return [];
    
    return commits.map(commit => {
      const message = commit.commit.message;
      const date = new Date(commit.commit.author.date);

      // Detectar tipo de commit baseado na mensagem
      let commitType: CommitType = 'other';
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.startsWith('feat')) commitType = 'feat';
      else if (lowerMessage.startsWith('fix')) commitType = 'fix';
      else if (lowerMessage.startsWith('docs')) commitType = 'docs';
      else if (lowerMessage.startsWith('style')) commitType = 'style';
      else if (lowerMessage.startsWith('refactor')) commitType = 'refactor';
      else if (lowerMessage.startsWith('test')) commitType = 'test';
      else if (lowerMessage.startsWith('chore')) commitType = 'chore';

      // Normalizar author para evitar null
      const normalizedAuthor = commit.author
        ? { login: commit.author.login, avatar_url: commit.author.avatar_url }
        : undefined;

      // Também pode normalizar commit.author se necessário (aqui mantido igual)
      const normalizedCommitAuthor = commit.commit.author
        ? {
            name: commit.commit.author.name,
            email: commit.commit.author.email,
            date: commit.commit.author.date
          }
        : undefined;

      return {
        ...commit,
        author: normalizedAuthor,
        commit: {
          ...commit.commit,
          author: normalizedCommitAuthor
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

  // Filtrar commits
  const filteredCommits = useMemo(() => {
    let filtered = [...extendedCommits];

    // Filtro de busca
    if (filters.searchTerm) {
      filtered = filtered.filter(commit => 
        commit.commit.message.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        commit.commit.author?.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        commit.sha.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filtro por autor
    if (filters.selectedAuthor !== 'all') {
      filtered = filtered.filter(commit => commit.commit.author?.name === filters.selectedAuthor);
    }

    // Filtro de tempo
    if (filters.timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(commit => {
        const commitDate = new Date(commit.commit.author?.date || 0);
        const diffInHours = (now.getTime() - commitDate.getTime()) / (1000 * 60 * 60);
        
        switch (filters.timeFilter) {
          case 'hour': return diffInHours <= 1;
          case 'day': return diffInHours <= 24;
          case 'week': return diffInHours <= 168;
          case 'month': return diffInHours <= 720;
          case 'year': return diffInHours <= 8760;
          default: return true;
        }
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(b.commit.author?.date || 0).getTime() - new Date(a.commit.author?.date || 0).getTime();
        case 'author':
          return (a.commit.author?.name || '').localeCompare(b.commit.author?.name || '');
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
  }, [extendedCommits, filters]);

  // Autores únicos
  const uniqueAuthors = useMemo(() => {
    return [...new Set(extendedCommits.map(commit => commit.commit.author?.name || ''))]
      .filter(name => name !== '')
      .sort();
  }, [extendedCommits]);

  // Atualizar filtro
  const updateFilter = useCallback((key: keyof CommitFiltersState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Resetar filtros
  const resetFilters = useCallback(() => {
    setFilters(prev => ({ ...initialFilters, selectedRepo: prev.selectedRepo, selectedBranch: prev.selectedBranch }));
  }, []);

  return {
    filters,
    extendedCommits,
    filteredCommits,
    uniqueAuthors,
    updateFilter,
    resetFilters
  };
};
