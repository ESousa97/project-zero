import { useState, useCallback, useMemo } from 'react';
import { useGitHub } from '../../context/GitHubContext';

type TimeFilter = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export interface PeriodData {
  repositories: number;
  stars: number;
  forks: number;
  commits: number;
  starsGrowthRate: string;
  forksGrowthRate: string;
  reposGrowthRate: string;
  issues: number;
  activeRepos: number;
  totalSize: number;
}

export interface TimeSeriesData {
  date: string;
  repositories: number;
  commits: number;
  stars: number;
  forks: number;
}

export interface LanguageStats {
  language: string;
  count: number;
  percentage: number;
  totalStars: number;
  avgStars: number;
}

export interface RepositoryMetrics {
  name: string;
  stars: number;
  forks: number;
  commits: number;
  issues: number;
  size: number;
  age: number;
  lastUpdate: string;
  language: string;
  activity: number;
}

const calculateSizeInMB = (sizeInKB: number): number => {
  return Math.round((sizeInKB / 1024) * 100) / 100;
};

export const useDashboardData = () => {
  const { repositories, user, loading, fetchRepositories, fetchUser, commits } = useGitHub();
  
  const [timeRange, setTimeRange] = useState<TimeFilter>('6M');
  const [selectedMetric, setSelectedMetric] = useState<'commits' | 'stars' | 'forks' | 'issues'>('commits');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoizar função de filtro de data para evitar recriação
  const getDateRangeFilter = useCallback((range: TimeFilter) => {
    if (range === 'ALL') return null;
    const now = new Date();
    const months = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 };
    const cutoffDate = new Date(now);
    cutoffDate.setMonth(cutoffDate.getMonth() - months[range]);
    return cutoffDate;
  }, []);

  // Memoizar repositórios filtrados com dependências específicas
  const filteredRepositories = useMemo(() => {
    const cutoffDate = getDateRangeFilter(timeRange);
    if (!cutoffDate) return repositories;
    return repositories.filter(repo => {
      const updatedDate = new Date(repo.updated_at);
      const pushedDate = repo.pushed_at ? new Date(repo.pushed_at) : updatedDate;
      const mostRecentDate = pushedDate > updatedDate ? pushedDate : updatedDate;
      return mostRecentDate >= cutoffDate;
    });
  }, [repositories, timeRange, getDateRangeFilter]);

  // Calcular estimativas de commits de forma estável SEM estado separado
  const stableCommitEstimates = useMemo(() => {
    const estimates = new Map<string, number>();
    
    repositories.forEach(repo => {
      const repoKey = `${repo.id}-${repo.updated_at}`;
      
      // Calcular estimativa de forma determinística
      const now = new Date();
      const repoAge = Math.max(1, (now.getTime() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const lastUpdate = new Date(repo.updated_at);
      const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Usar hash do ID do repo para gerar valores consistentes
      const repoHash = repo.id % 100;
      
      // Estimativa base mais realista - baseada na idade do repositório
      let baseCommits = Math.floor(repoAge / 7) * 5; // 5 commits por semana em média
      
      // Adicionar variação baseada no hash (consistente) - valores maiores
      baseCommits += Math.floor(repoHash / 2) + 20; // Mínimo 20 commits extras
      
      // Ajustar pela atividade (sem randomização) - multiplicadores maiores
      if (daysSinceUpdate <= 7) {
        baseCommits *= 3; // Muito ativo
      } else if (daysSinceUpdate <= 30) {
        baseCommits *= 2.5; // Moderadamente ativo
      } else if (daysSinceUpdate <= 90) {
        baseCommits *= 2; // Pouco ativo
      } else if (daysSinceUpdate <= 365) {
        baseCommits *= 1.5; // Ativo no último ano
      }
      
      // Ajustar pela popularidade - multiplicadores maiores
      if (repo.stargazers_count > 100) {
        baseCommits *= 4;
      } else if (repo.stargazers_count > 50) {
        baseCommits *= 3;
      } else if (repo.stargazers_count > 10) {
        baseCommits *= 2;
      } else if (repo.stargazers_count > 0) {
        baseCommits *= 1.5;
      }
      
      // Ajustar pelo tamanho do repositório
      if (repo.size > 10000) { // Repos grandes
        baseCommits *= 2;
      } else if (repo.size > 1000) {
        baseCommits *= 1.5;
      }
      
      // Mínimo muito maior para ser realista
      const finalEstimate = Math.max(50, Math.floor(baseCommits));
      estimates.set(repoKey, finalEstimate);
    });
    
    return estimates;
  }, [repositories]);

  // Memoizar dados do período atual - CORRIGIDO COM VALORES REALISTAS
  // CORRIGIR: Priorizar commits reais quando disponíveis
  // MANTER: Esta lógica está funcionando corretamente no Dashboard
  const currentPeriodData: PeriodData = useMemo(() => {
    const now = new Date();
    const totalStars = filteredRepositories.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = filteredRepositories.reduce((sum, r) => sum + r.forks_count, 0);
    const totalIssues = filteredRepositories.reduce((sum, r) => sum + r.open_issues_count, 0);
    const totalSize = filteredRepositories.reduce((sum, r) => sum + calculateSizeInMB(r.size), 0);
    const cutoffDate = getDateRangeFilter(timeRange);
    
    const activeRepos = filteredRepositories.filter(repo => {
      if (!cutoffDate) {
        const lastUpdate = new Date(repo.updated_at);
        const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 30;
      } else {
        const lastUpdate = new Date(repo.updated_at);
        const pushedAt = new Date(repo.pushed_at || repo.updated_at);
        return lastUpdate >= cutoffDate || pushedAt >= cutoffDate;
      }
    }).length;
    
    // CORRIGIDO: Evitar sobreposição - commits reais têm prioridade ABSOLUTA
    let commitsInPeriod: number;
    
    // Sempre verificar commits reais primeiro e usar APENAS eles se disponíveis
    if (commits && commits.length > 0) {
      if (!cutoffDate) {
        // TODOS os commits reais
        commitsInPeriod = commits.length;
      } else {
        // Filtrar commits reais pelo período
        const realCommitsInPeriod = commits.filter(commit => {
          try {
            const commitDate = new Date(commit.commit.author.date);
            return commitDate >= cutoffDate;
          } catch {
            return false;
          }
        });
        commitsInPeriod = realCommitsInPeriod.length;
      }
      
      // Se temos commits reais, NÃO usar estimativas
      console.log(`🔍 Dashboard usando commits reais: ${commitsInPeriod} para período ${timeRange}`);
    } else {
      // Só usar estimativas se NÃO houver commits reais
      console.log(`📊 Dashboard usando estimativas para período ${timeRange}`);
      const reposToUse = !cutoffDate ? repositories : filteredRepositories;
      
      commitsInPeriod = reposToUse.reduce((total, repo) => {
        const repoKey = `${repo.id}-${repo.updated_at}`;
        const repoEstimate = stableCommitEstimates.get(repoKey) || 50;
        
        if (!cutoffDate) {
          return total + repoEstimate;
        } else {
          const periodDays = (now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24);
          const repoCreated = new Date(repo.created_at);
          
          if (repoCreated.getTime() < cutoffDate.getTime()) {
            const lastUpdate = new Date(repo.updated_at);
            const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
            
            let commitsPerDay = daysSinceUpdate <= 7
              ? 3
              : daysSinceUpdate <= 30
                ? 2
                : daysSinceUpdate <= 90
                  ? 1
                  : 0.5;
            
            if (repo.stargazers_count > 50) commitsPerDay *= 2;
            else if (repo.stargazers_count > 10) commitsPerDay *= 1.5;
            
            const periodCommits = Math.floor(periodDays * commitsPerDay);
            return total + Math.max(5, periodCommits);
          } else {
            const daysInPeriod = (now.getTime() - repoCreated.getTime()) / (1000 * 60 * 60 * 24);
            const repoAge = Math.max(1, (now.getTime() - repoCreated.getTime()) / (1000 * 60 * 60 * 24));
            const proportion = Math.min(1, daysInPeriod / repoAge);
            const periodCommits = Math.floor(repoEstimate * proportion);
            
            return total + Math.max(10, periodCommits);
          }
        }
      }, 0);
    }

    return {
      repositories: filteredRepositories.length,
      stars: totalStars,
      forks: totalForks,
      commits: commitsInPeriod, // SEMPRE commits reais quando disponíveis
      issues: totalIssues,
      activeRepos,
      totalSize: Math.round(totalSize * 100) / 100,
      starsGrowthRate: '0%',
      forksGrowthRate: '0%',
      reposGrowthRate: '0%',
    };
  }, [filteredRepositories, commits, timeRange, getDateRangeFilter, repositories, stableCommitEstimates]);

  const totalStats = useMemo(() => {
    if (!repositories.length) return null;
    const now = new Date();
    const totalStars = repositories.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, r) => sum + r.forks_count, 0);
    const totalWatchers = repositories.reduce((sum, r) => sum + r.watchers_count, 0);
    const totalIssues = repositories.reduce((sum, r) => sum + r.open_issues_count, 0);
    const totalSize = repositories.reduce((sum, r) => sum + calculateSizeInMB(r.size), 0);
    const privateRepos = repositories.filter(r => r.private).length;
    const publicRepos = repositories.length - privateRepos;
    const activeRepos = repositories.filter(r => {
      const lastUpdate = new Date(r.updated_at);
      const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    }).length;
    const avgStars = repositories.length > 0 ? totalStars / repositories.length : 0;
    const mostPopularRepo = repositories.length > 0 ? repositories.reduce((prev, curr) =>
      prev.stargazers_count > curr.stargazers_count ? prev : curr
    ) : null;
    const recentActivity = repositories.filter(r => {
      const lastUpdate = new Date(r.updated_at);
      const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    return {
      total: repositories.length,
      totalStars,
      totalForks,
      totalWatchers,
      totalIssues,
      totalSize: Math.round(totalSize * 100) / 100,
      privateRepos,
      publicRepos,
      activeRepos,
      avgStars: avgStars.toFixed(1),
      mostPopularRepo: mostPopularRepo?.name || 'N/A',
      recentActivity,
    };
  }, [repositories]);

  // Memoizar dados de linguagem com otimização
  const languageData: LanguageStats[] = useMemo(() => {
    if (!filteredRepositories.length) return [];
    
    const languageMap = new Map<string, { count: number; stars: number; repos: string[] }>();
    filteredRepositories.forEach(repo => {
      if (repo.language) {
        const current = languageMap.get(repo.language) || { count: 0, stars: 0, repos: [] };
        languageMap.set(repo.language, {
          count: current.count + 1,
          stars: current.stars + repo.stargazers_count,
          repos: [...current.repos, repo.name],
        });
      }
    });
    
    const total = filteredRepositories.length;
    return Array.from(languageMap.entries())
      .map(([language, data]) => ({
        language,
        count: data.count,
        percentage: (data.count / total) * 100,
        totalStars: data.stars,
        avgStars: data.stars / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredRepositories]);

  // Otimizar timeSeriesData com valores estáveis
  const timeSeriesData: TimeSeriesData[] = useMemo(() => {
    if (!filteredRepositories.length) {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      return months.map(month => ({
        date: month,
        repositories: 0,
        commits: 0,
        stars: 0,
        forks: 0,
      }));
    }
    
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    const data: { [key: string]: TimeSeriesData } = {};
    
    // Inicializar dados para todos os meses do ano atual
    months.forEach(month => {
      data[month] = {
        date: month,
        repositories: 0,
        commits: 0,
        stars: 0,
        forks: 0,
      };
    });
    
    filteredRepositories.forEach(repo => {
      const createdDate = new Date(repo.created_at);
      const updatedDate = new Date(repo.updated_at);
      const repoKey = `${repo.id}-${repo.updated_at}`;
      const totalRepoCommits = stableCommitEstimates.get(repoKey) || 50;
      
      // Dados baseados na data de criação
      if (createdDate.getFullYear() === currentYear) {
        const createdMonth = months[createdDate.getMonth()];
        if (data[createdMonth]) {
          data[createdMonth].repositories += 1;
        }
      }
      
      // Dados baseados na data de atualização
      if (updatedDate.getFullYear() === currentYear) {
        const updatedMonth = months[updatedDate.getMonth()];
        if (data[updatedMonth]) {
          data[updatedMonth].stars += repo.stargazers_count;
          data[updatedMonth].forks += repo.forks_count;
          
          // Distribuir commits de forma mais realista pelos meses
          const repoAge = Math.max(1, (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          const monthsActive = Math.min(12, Math.ceil(repoAge / 30));
          let commitsPerMonth = Math.floor(totalRepoCommits / monthsActive);
          
          // Garantir um mínimo realista
          commitsPerMonth = Math.max(10, commitsPerMonth);
          
          // Se o repo foi atualizado recentemente, aumentar os commits do mês
          const daysSinceUpdate = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceUpdate <= 30) {
            commitsPerMonth *= 2;
          }
          
          data[updatedMonth].commits += commitsPerMonth;
        }
      }
    });
    
    return Object.values(data)
      .sort((a, b) => {
        const monthOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return monthOrder.indexOf(a.date) - monthOrder.indexOf(b.date);
      })
      .slice(-6); // Últimos 6 meses
  }, [filteredRepositories, stableCommitEstimates]);

  // Otimizar repositoryMetrics
  const repositoryMetrics: RepositoryMetrics[] = useMemo(() => {
    if (!filteredRepositories.length) return [];
    
    const now = Date.now();
    return filteredRepositories.map(repo => {
      const created = new Date(repo.created_at);
      const updated = new Date(repo.updated_at);
      const age = (now - created.getTime()) / (1000 * 3600 * 24);
      const lastUpdateDays = (now - updated.getTime()) / (1000 * 3600 * 24);
      
      return {
        name: repo.name,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        commits: 0,
        issues: repo.open_issues_count,
        size: calculateSizeInMB(repo.size),
        age: Math.round(age),
        lastUpdate: repo.updated_at,
        language: repo.language || 'Unknown',
        activity: Math.max(0, 100 - lastUpdateDays),
      };
    });
  }, [filteredRepositories]);

  // Melhorar hasPerformanceData
  const hasPerformanceData = useMemo(() => {
    if (!repositoryMetrics.length) return false;
    
    const reposWithStars = repositoryMetrics.filter(repo => repo.stars > 0).length;
    const reposWithForks = repositoryMetrics.filter(repo => repo.forks > 0).length;
    const reposWithActivity = repositoryMetrics.filter(repo => repo.activity > 20).length;
    
    return reposWithStars >= 1 || reposWithForks >= 1 || reposWithActivity >= 1;
  }, [repositoryMetrics]);

  // Otimizar handleRefresh com useCallback
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await Promise.all([fetchRepositories(), fetchUser()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchRepositories, fetchUser, isRefreshing]);

  return {
    // Data
    repositories,
    filteredRepositories,
    currentPeriodData,
    totalStats,
    languageData,
    timeSeriesData,
    repositoryMetrics,
    hasPerformanceData,
    user,
    loading,
    
    // State
    timeRange,
    selectedMetric,
    isRefreshing,
    
    // Actions
    setTimeRange,
    setSelectedMetric,
    handleRefresh,
  };
};
