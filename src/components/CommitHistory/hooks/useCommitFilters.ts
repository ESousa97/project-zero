// src/components/CommitHistory/hooks/useCommitFilters.ts - ATUALIZADO
import { useState, useCallback, useMemo } from 'react';
import type { ExtendedCommit, CommitFiltersState, CommitType } from '../types';
import { getTimeFilterMilliseconds } from '../types';
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
    console.log(`🔄 Processando ${commits.length} commits totais para análise...`);
    
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

      // Garantir que commit.author seja sempre definido
      const normalizedCommitAuthor = {
        name: commit.commit.author?.name || 'Unknown',
        email: commit.commit.author?.email || 'unknown@email.com',
        date: commit.commit.author?.date || new Date().toISOString()
      };

      // Garantir que commit.committer seja sempre definido
      const normalizedCommitCommitter = {
        name: commit.commit.committer?.name || normalizedCommitAuthor.name,
        email: commit.commit.committer?.email || normalizedCommitAuthor.email,
        date: commit.commit.committer?.date || normalizedCommitAuthor.date
      };

      return {
        ...commit,
        author: commit.author ? {
          login: commit.author.login,
          avatar_url: commit.author.avatar_url
        } : undefined,
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

  // CORRIGIDO: Replicar lógica do Dashboard - commits reais têm prioridade ABSOLUTA
  const filteredCommits = useMemo(() => {
    // Se não temos commits reais, retornar array vazio
    if (!commits.length) {
      console.log(`🔍 Nenhum commit real disponível para filtrar`);
      return [];
    }

    let filtered = [...extendedCommits];
    
    console.log(`🔍 Iniciando filtragem de ${filtered.length} commits REAIS...`);

    // 1. Filtro de busca
    if (filters.searchTerm) {
      const beforeFilter = filtered.length;
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(commit => 
        commit.commit.message.toLowerCase().includes(searchTerm) ||
        commit.commit.author.name.toLowerCase().includes(searchTerm) ||
        commit.sha.toLowerCase().includes(searchTerm) ||
        (commit.author?.login || '').toLowerCase().includes(searchTerm)
      );
      console.log(`🔍 Filtro busca: ${beforeFilter} → ${filtered.length} commits`);
    }

    // 2. Filtro por autor
    if (filters.selectedAuthor !== 'all') {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(commit => commit.commit.author.name === filters.selectedAuthor);
      console.log(`👤 Filtro autor: ${beforeFilter} → ${filtered.length} commits`);
    }

    // 3. Filtro de tempo (aplicado a TODOS os dados REAIS)
    if (filters.timeFilter !== 'all') {
      const beforeFilter = filtered.length;
      const filterMilliseconds = getTimeFilterMilliseconds(filters.timeFilter);
      
      if (filterMilliseconds) {
        const now = Date.now();
        const cutoffTime = now - filterMilliseconds;
        
        filtered = filtered.filter(commit => {
          try {
            const commitTime = new Date(commit.commit.author.date).getTime();
            const isInPeriod = commitTime >= cutoffTime;
            return isInPeriod;
          } catch (error) {
            console.warn('Erro ao processar data do commit:', error);
            return false;
          }
        });
      }
      
      console.log(`⏰ Filtro tempo (${filters.timeFilter}): ${beforeFilter} → ${filtered.length} commits REAIS`);
    }

    // 4. Ordenação
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

    console.log(`📋 Total após filtros REAIS: ${filtered.length} commits`);
    return filtered;
  }, [extendedCommits, filters, commits.length]);

  // Para a LISTA: Apenas os 10 melhores commits filtrados (como no Dashboard)
  const limitedCommitsForList = useMemo(() => {
    const limited = filteredCommits.slice(0, 10);
    console.log(`🖥️ Lista exibindo: ${limited.length} de ${filteredCommits.length} commits filtrados REAIS`);
    return limited;
  }, [filteredCommits]);

  // Para ANALYTICS: TODOS os commits filtrados REAIS (sem limite)
  const allFilteredCommitsForAnalytics = useMemo(() => {
    console.log(`📊 Analytics usando: ${filteredCommits.length} commits filtrados REAIS completos`);
    return filteredCommits;
  }, [filteredCommits]);

  // Autores únicos baseados nos commits filtrados
  const uniqueAuthors = useMemo(() => {
    return [...new Set(filteredCommits.map(commit => commit.commit.author.name))]
      .filter(name => name !== '')
      .sort();
  }, [filteredCommits]);

  // Atualizar filtro
  const updateFilter = useCallback((key: keyof CommitFiltersState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Resetar filtros
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
    limitedCommitsForList, // 10 commits para lista
    allFilteredCommitsForAnalytics, // Todos os commits filtrados para analytics
    uniqueAuthors,
    updateFilter,
    resetFilters,
    // Estatísticas úteis
    totalFilteredCount: filteredCommits.length,
    totalCommitsCount: extendedCommits.length,
    isFiltered: filters.searchTerm !== '' || 
                filters.selectedAuthor !== 'all' || 
                filters.timeFilter !== 'all' || 
                filters.sortBy !== 'date'
  };
};
