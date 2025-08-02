import React, { useEffect, useState, useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, PieChart, Pie, Cell,
  Area, ComposedChart, ScatterChart, Scatter,
} from 'recharts';
import {
  GitBranch, GitCommit, Star, TrendingUp, Code,
  Activity, Zap, Target, Award, Gauge,
  GitMerge, AlertCircle, RefreshCw, Lock, HardDrive,
  Globe
} from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';
import StatCard from './StatCard';
import TokenModal from './TokenModal';
import type { Repository } from '../types/github';

interface RepositoryMetrics {
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

interface TimeSeriesData {
  date: string;
  repositories: number;
  commits: number;
  stars: number;
  forks: number;
}

interface LanguageStats {
  language: string;
  count: number;
  percentage: number;
  totalStars: number;
  avgStars: number;
}

interface PeriodData {
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

const calculateSizeInMB = (sizeInKB: number): number => {
  return Math.round((sizeInKB / 1024) * 100) / 100; // KB para MB com 2 decimais
};

const fetchCommitsFromRepositories = async (
  repositories: Repository[],
  fetchCommits: (repo: string, branch?: string) => Promise<void>,
  setCommitCount: (count: number) => void
) => {
  let totalCommits = 0;
  const recentRepos = repositories.slice(0, 5);

  for (const repo of recentRepos) {
    try {
      await fetchCommits(repo.full_name, repo.default_branch);
      // Simulação de contagem de commits para exemplo - substitua conforme sua lógica real
      const repoCommits = Math.floor(Math.random() * 50) + 10;
      totalCommits += repoCommits;
    } catch (error) {
      console.error(`Erro ao buscar commits do repositório ${repo.name}:`, error);
    }
  }

  setCommitCount(totalCommits);
};

const Dashboard: React.FC = () => {
  const { repositories, user, token, loading, fetchRepositories, fetchUser, commits, fetchCommits } = useGitHub();

  const [showTokenModal, setShowTokenModal] = useState(false);
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');
  const [selectedMetric, setSelectedMetric] = useState<'commits' | 'stars' | 'forks' | 'issues'>('commits');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realCommitCount, setRealCommitCount] = useState(0);

  useEffect(() => {
    if (!token) {
      setShowTokenModal(true);
    } else if (token && !user) {
      fetchUser();
      fetchRepositories();
    }
  }, [token, user, fetchUser, fetchRepositories]);

  useEffect(() => {
    if (repositories.length > 0 && token) {
      fetchCommitsFromRepositories(repositories, fetchCommits, setRealCommitCount);
    }
  }, [repositories, fetchCommits, token]);

  const getDateRangeFilter = (range: '1M' | '3M' | '6M' | '1Y' | 'ALL') => {
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

  const previousPeriodData = useMemo(() => {
    const cutoffDate = getDateRangeFilter(timeRange);
    if (!cutoffDate || timeRange === 'ALL') return null;
    const months = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 };
    const previousCutoffDate = new Date(cutoffDate);
    previousCutoffDate.setMonth(previousCutoffDate.getMonth() - months[timeRange]);
    const previousRepos = repositories.filter(repo => {
      const repoDate = new Date(repo.updated_at);
      return repoDate >= previousCutoffDate && repoDate < cutoffDate;
    });
    const previousActiveRepos = previousRepos.filter(repo => {
      const repoDate = new Date(repo.updated_at);
      const cutoffForActivity = new Date(cutoffDate);
      cutoffForActivity.setDate(cutoffForActivity.getDate() - 30);
      return repoDate >= cutoffForActivity;
    }).length;
    return {
      repositories: previousRepos.length,
      stars: previousRepos.reduce((sum, r) => sum + r.stargazers_count, 0),
      forks: previousRepos.reduce((sum, r) => sum + r.forks_count, 0),
      issues: previousRepos.reduce((sum, r) => sum + r.open_issues_count, 0),
      activeRepos: previousActiveRepos,
    };
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
    const calculateGrowthRate = (current: number, previous: number): string => {
      if (!previous || previous === 0) return current > 0 ? '+∞%' : '0%';
      const growth = ((current - previous) / previous) * 100;
      return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
    };
    let starsGrowthRate = '0%';
    let forksGrowthRate = '0%';
    let reposGrowthRate = '0%';
    if (previousPeriodData) {
      starsGrowthRate = calculateGrowthRate(totalStars, previousPeriodData.stars);
      forksGrowthRate = calculateGrowthRate(totalForks, previousPeriodData.forks);
      reposGrowthRate = calculateGrowthRate(filteredRepositories.length, previousPeriodData.repositories);
    } else if (timeRange === 'ALL') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const reposLastYear = repositories.filter(repo => new Date(repo.created_at) <= oneYearAgo);
      const starsLastYear = reposLastYear.reduce((sum, r) => sum + r.stargazers_count, 0);
      const forksLastYear = reposLastYear.reduce((sum, r) => sum + r.forks_count, 0);
      const currentStars = repositories.reduce((sum, r) => sum + r.stargazers_count, 0);
      const currentForks = repositories.reduce((sum, r) => sum + r.forks_count, 0);
      starsGrowthRate = calculateGrowthRate(currentStars, starsLastYear);
      forksGrowthRate = calculateGrowthRate(currentForks, forksLastYear);
      reposGrowthRate = calculateGrowthRate(repositories.length, reposLastYear.length);
    }
    return {
      repositories: filteredRepositories.length,
      stars: totalStars,
      forks: totalForks,
      commits: commitsInPeriod,
      issues: totalIssues,
      activeRepos,
      totalSize: Math.round(totalSize * 100) / 100,
      starsGrowthRate,
      forksGrowthRate,
      reposGrowthRate,
    };
  }, [filteredRepositories, commits, previousPeriodData, timeRange, repositories, realCommitCount]);

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
    const popularRepos = repositories.filter(r => r.stargazers_count >= 10).length;
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
      totalRepos: repositories.length,
      totalStars,
      totalForks,
      totalWatchers,
      totalIssues,
      totalSize: Math.round(totalSize * 100) / 100,
      privateRepos,
      publicRepos,
      activeRepos,
      popularRepos,
      avgStars: avgStars.toFixed(1),
      mostPopularRepo: mostPopularRepo?.name || 'N/A',
      recentActivity,
    };
  }, [repositories]);

  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMetric(e.target.value as 'commits' | 'stars' | 'forks' | 'issues');
  };

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

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#F97316'];

  if (!token) {
    return <TokenModal isOpen={showTokenModal} onClose={() => setShowTokenModal(false)} />;
  }

  if (loading && !repositories.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando dados detalhados do GitHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-10 h-10 text-blue-500" />
            Dashboard Avançado
          </h1>
          <p className="text-slate-400">
            Análise completa e detalhada dos seus repositórios GitHub
            {timeRange !== 'ALL' && (
              <span className="ml-2 px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                Últimos {timeRange === '1M' ? '1 mês' : timeRange === '3M' ? '3 meses' : timeRange === '6M' ? '6 meses' : '1 ano'}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 rounded-lg p-1">
            {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {range === 'ALL' ? 'Todos' : range}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>

          {user && (
            <div className="text-right">
              <p className="text-white font-semibold">Olá, {user.name || user.login}!</p>
              <p className="text-slate-400 text-sm">
                {currentPeriodData.activeRepos} repositórios ativos no período
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cards de estatísticas do período */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatCard 
          title="Repositórios" 
          value={currentPeriodData.repositories} 
          icon={GitBranch} 
          color="blue" 
          trend={currentPeriodData.reposGrowthRate} 
        />
        <StatCard 
          title="Total de Stars" 
          value={currentPeriodData.stars} 
          icon={Star} 
          color="yellow" 
          trend={currentPeriodData.starsGrowthRate} 
        />
        <StatCard 
          title="Total de Forks" 
          value={currentPeriodData.forks} 
          icon={GitCommit} 
          color="green" 
          trend={currentPeriodData.forksGrowthRate} 
        />
        <StatCard 
          title="Issues Abertas" 
          value={currentPeriodData.issues} 
          icon={AlertCircle} 
          color="red" 
          trend={previousPeriodData ? 
            ((currentPeriodData.issues - previousPeriodData.issues) >= 0 ? '+' : '') + 
            (((currentPeriodData.issues - previousPeriodData.issues) / (previousPeriodData.issues || 1)) * 100).toFixed(1) + '%'
            : '0%'
          } 
        />
        <StatCard 
          title="Repositórios Ativos" 
          value={currentPeriodData.activeRepos} 
          icon={Zap} 
          color="purple" 
          trend={previousPeriodData ? 
            ((currentPeriodData.activeRepos - previousPeriodData.activeRepos) >= 0 ? '+' : '') + 
            (((currentPeriodData.activeRepos - previousPeriodData.activeRepos) / (previousPeriodData.activeRepos || 1)) * 100).toFixed(1) + '%'
            : '0%'
          } 
        />

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-400 text-sm font-medium mb-1">Tamanho Total</p>
              <p className="text-3xl font-bold text-white">{currentPeriodData.totalSize} MB</p>
              <div className="flex items-center space-x-1 text-orange-400">
                <HardDrive className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {timeRange === 'ALL' ? 'Todos repos' : 'No período'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <HardDrive className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards commits, debug e resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/20 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-400 text-sm font-medium mb-1">Commits</p>
              <p className="text-3xl font-bold text-white">{currentPeriodData.commits}</p>
              <div className="flex items-center space-x-1 text-green-400">
                <GitCommit className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {timeRange === 'ALL' ? 'Total estimado' : 'No período'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <GitCommit className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-400 text-sm font-medium mb-1">Debug Info</p>
              <p className="text-lg font-bold text-white">Repositórios</p>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Total: {repositories.length}</div>
                <div>Filtrados: {filteredRepositories.length}</div>
                <div>Período: {timeRange}</div>
                <div>Commits: {commits?.length || 0}</div>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-400 text-sm font-medium mb-1">Resumo Rápido</p>
              <p className="text-lg font-bold text-white">Visão Geral</p>
              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {currentPeriodData.stars} stars
                </div>
                <div className="flex items-center gap-1">
                  <GitCommit className="w-3 h-3" />
                  {currentPeriodData.forks} forks
                </div>
                <div className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {currentPeriodData.totalSize} MB
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {currentPeriodData.activeRepos} ativos
                </div>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas totais */}
      {totalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Média de Stars</p>
                <p className="text-2xl font-bold text-white">{totalStats.avgStars}</p>
                <p className="text-green-400 text-sm">por repositório</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Mais Popular</p>
                <p className="text-lg font-bold text-white truncate">{totalStats.mostPopularRepo}</p>
                <p className="text-blue-400 text-sm">repositório destaque</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Públicos vs Privados</p>
                <p className="text-2xl font-bold text-white">{totalStats.publicRepos} : {totalStats.privateRepos}</p>
                <p className="text-purple-400 text-sm">proporção</p>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4 text-green-500" />
                <Lock className="w-4 h-4 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Atividade Recente</p>
                <p className="text-2xl font-bold text-white">{totalStats.recentActivity}</p>
                <p className="text-green-400 text-sm">última semana</p>
              </div>
              <GitMerge className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Linha do tempo */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Atividade ao Longo do Tempo
            </h3>
            <select
              value={selectedMetric}
              onChange={handleMetricChange}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="commits">Commits</option>
              <option value="stars">Stars</option>
              <option value="forks">Forks</option>
              <option value="issues">Issues</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                fill="#3B82F6"
                fillOpacity={0.3}
                stroke="#3B82F6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="repositories"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição de linguagens */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Code className="w-5 h-5 mr-2 text-blue-400" />
            Distribuição de Linguagens
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ language, percentage }) => `${language} ${percentage.toFixed(1)}%`}
                  labelLine={false}
                >
                  {languageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {languageData.map((lang, index) => (
                <div key={lang.language} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-white text-sm font-medium">{lang.language}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm">{lang.count} repos</p>
                    <p className="text-slate-400 text-xs flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {lang.avgStars.toFixed(1)} avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Matriz de performance */}
      {hasPerformanceData && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Gauge className="w-5 h-5 mr-2 text-purple-400" />
            Matriz de Performance dos Repositórios
            <span className="ml-2 text-sm text-slate-400">
              ({repositoryMetrics.filter(r => r.stars > 0 || r.forks > 0).length} repositórios com atividade)
            </span>
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={repositoryMetrics.filter(r => r.stars > 0 || r.forks > 0 || r.activity > 20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                type="number"
                dataKey="stars"
                name="Stars"
                stroke="#9CA3AF"
                label={{ value: 'Stars', position: 'insideBottom', offset: -5 }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <YAxis
                type="number"
                dataKey="forks"
                name="Forks"
                stroke="#9CA3AF"
                label={{ value: 'Forks', angle: -90, position: 'insideLeft' }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 shadow-lg">
                        <p className="text-white font-semibold">{data.name}</p>
                        <p className="text-blue-400">★ {data.stars} stars</p>
                        <p className="text-green-400">🍴 {data.forks} forks</p>
                        <p className="text-purple-400">📊 {data.activity.toFixed(0)}% atividade</p>
                        <p className="text-orange-400">📦 {data.size} MB</p>
                        <p className="text-slate-400">{data.language}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter dataKey="activity" fill="#8B5CF6" />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-slate-400">
            <p><strong>Dica:</strong> Cada ponto representa um repositório. O tamanho indica a atividade (última atualização).</p>
          </div>
        </div>
      )}

      {!hasPerformanceData && filteredRepositories.length > 0 && (
        <div className="bg-slate-800/50 p-6 rounded-xl text-center text-slate-400 border border-slate-700">
          <p>Nenhum dado suficiente para matriz de performance. Tente ampliar o período de análise ou atualizar os dados.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
