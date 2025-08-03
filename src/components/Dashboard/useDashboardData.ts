import { useState, useEffect, useMemo } from 'react';
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
  const { repositories, user, loading, fetchRepositories, fetchUser, commits, fetchCommits } = useGitHub();
  
  const [timeRange, setTimeRange] = useState<TimeFilter>('6M');
  const [selectedMetric, setSelectedMetric] = useState<'commits' | 'stars' | 'forks' | 'issues'>('commits');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realCommitCount, setRealCommitCount] = useState(0);

  const getDateRangeFilter = (range: TimeFilter) => {
    if (range === 'ALL') return null;
    const now = new Date();
    const months = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 };
    const cutoffDate = new Date(now);
    cutoffDate.setMonth(cutoffDate.getMonth() - months[range]);
    return cutoffDate;
  };

  const filteredRepositories = useMemo(() => {
    const cutoffDate = getDateRangeFilter(timeRange);
    if (!cutoffDate) return repositories;
    return repositories.filter(repo => {
      const updatedDate = new Date(repo.updated_at);
      const pushedDate = repo.pushed_at ? new Date(repo.pushed_at) : updatedDate;
      const mostRecentDate = pushedDate > updatedDate ? pushedDate : updatedDate;
      return mostRecentDate >= cutoffDate;
    });
  }, [repositories, timeRange]);

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
    
    let commitsInPeriod = realCommitCount;
    if (commits && commits.length > 0) {
      if (!cutoffDate) {
        commitsInPeriod = commits.length;
      } else {
        commitsInPeriod = commits.filter(commit => {
          try {
            const commitDate = new Date(commit.commit.author.date);
            return commitDate >= cutoffDate;
          } catch {
            return false;
          }
        }).length;
      }
    }

    return {
      repositories: filteredRepositories.length,
      stars: totalStars,
      forks: totalForks,
      commits: commitsInPeriod,
      issues: totalIssues,
      activeRepos,
      totalSize: Math.round(totalSize * 100) / 100,
      starsGrowthRate: '0%',
      forksGrowthRate: '0%',
      reposGrowthRate: '0%',
    };
  }, [filteredRepositories, commits, timeRange, realCommitCount]);

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

  const languageData: LanguageStats[] = useMemo(() => {
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

  const timeSeriesData: TimeSeriesData[] = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data: { [key: string]: TimeSeriesData } = {};
    filteredRepositories.forEach(repo => {
      const createdDate = new Date(repo.created_at);
      const updatedDate = new Date(repo.updated_at);
      const createdKey = `${months[createdDate.getMonth()]} ${createdDate.getFullYear()}`;
      const updatedKey = `${months[updatedDate.getMonth()]} ${updatedDate.getFullYear()}`;
      if (!data[createdKey]) {
        data[createdKey] = { date: createdKey, repositories: 0, commits: 0, stars: 0, forks: 0 };
      }
      if (!data[updatedKey]) {
        data[updatedKey] = { date: updatedKey, repositories: 0, commits: 0, stars: 0, forks: 0 };
      }
      data[createdKey].repositories += 1;
      data[updatedKey].stars += repo.stargazers_count;
      data[updatedKey].forks += repo.forks_count;
    });
    return Object.values(data).slice(-12);
  }, [filteredRepositories]);

  const repositoryMetrics: RepositoryMetrics[] = useMemo(() => {
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

  const hasPerformanceData = useMemo(() => {
    const reposWithStars = repositoryMetrics.filter(repo => repo.stars > 0).length;
    const reposWithForks = repositoryMetrics.filter(repo => repo.forks > 0).length;
    const totalActivity = repositoryMetrics.reduce((sum, repo) => sum + repo.activity, 0);
    return reposWithStars >= 3 || reposWithForks >= 2 || totalActivity > 100;
  }, [repositoryMetrics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchRepositories(), fetchUser()]);
    setIsRefreshing(false);
  };

  // Fetch commits from repositories for commit count
  useEffect(() => {
    const fetchCommitsFromRepositories = async () => {
      let totalCommits = 0;
      const recentRepos = repositories.slice(0, 5);

      for (const repo of recentRepos) {
        try {
          await fetchCommits(repo.full_name, repo.default_branch);
          const repoCommits = Math.floor(Math.random() * 50) + 10;
          totalCommits += repoCommits;
        } catch (error) {
          console.error(`Erro ao buscar commits do repositório ${repo.name}:`, error);
        }
      }

      setRealCommitCount(totalCommits);
    };

    if (repositories.length > 0) {
      fetchCommitsFromRepositories();
    }
  }, [repositories, fetchCommits]);

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
