import React, { useEffect, useState, useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, PieChart, Pie, Cell,
  Area, ComposedChart, ScatterChart, Scatter,
} from 'recharts';
import {
  GitBranch, GitCommit, Star, Eye, TrendingUp, Code,
  Activity, Clock, Zap, Target, Award, Gauge, Layers,
  GitMerge, AlertCircle, RefreshCw, Lock
} from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';
import StatCard from './StatCard';
import TokenModal from './TokenModal';

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

const Dashboard: React.FC = () => {
  const { repositories, user, token, loading, fetchRepositories, fetchUser, commits } = useGitHub();

  const [showTokenModal, setShowTokenModal] = useState(false);
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');
  const [selectedMetric, setSelectedMetric] = useState<'commits' | 'stars' | 'forks' | 'issues'>('commits');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!token) {
      setShowTokenModal(true);
    } else if (token && !user) {
      fetchUser();
      fetchRepositories();
    }
  }, [token, user, fetchUser, fetchRepositories]);

  // Função para filtrar dados por período
  const getDateRangeFilter = (range: '1M' | '3M' | '6M' | '1Y' | 'ALL') => {
    if (range === 'ALL') return null;
    
    const now = new Date();
    const months = {
      '1M': 1,
      '3M': 3,
      '6M': 6,
      '1Y': 12
    };
    
    const cutoffDate = new Date(now);
    cutoffDate.setMonth(cutoffDate.getMonth() - months[range]);
    
    return cutoffDate;
  };

  // Filtrar repositórios por período - CORREÇÃO: melhorar lógica de filtro
  const filteredRepositories = useMemo(() => {
    const cutoffDate = getDateRangeFilter(timeRange);
    if (!cutoffDate) {
      console.log('Modo ALL - Mostrando todos os repositórios:', repositories.length);
      return repositories;
    }
    
    const filtered = repositories.filter(repo => {
      // Usar updated_at OU pushed_at, o que for mais recente
      const updatedDate = new Date(repo.updated_at);
      const pushedDate = repo.pushed_at ? new Date(repo.pushed_at) : updatedDate;
      const mostRecentDate = pushedDate > updatedDate ? pushedDate : updatedDate;
      
      const isInPeriod = mostRecentDate >= cutoffDate;
      return isInPeriod;
    });
    
    console.log(`Período ${timeRange} - Repositórios filtrados:`, filtered.length, 'de', repositories.length);
    return filtered;
  }, [repositories, timeRange]);

  // Calcular dados do período anterior para comparação
  const previousPeriodData = useMemo(() => {
    const cutoffDate = getDateRangeFilter(timeRange);
    if (!cutoffDate || timeRange === 'ALL') return null;

    const months = {
      '1M': 1,
      '3M': 3,
      '6M': 6,
      '1Y': 12
    };

    // Período anterior
    const previousCutoffDate = new Date(cutoffDate);
    previousCutoffDate.setMonth(previousCutoffDate.getMonth() - months[timeRange]);

    const previousRepos = repositories.filter(repo => {
      const repoDate = new Date(repo.updated_at);
      return repoDate >= previousCutoffDate && repoDate < cutoffDate;
    });

    // Calcular atividade real do período anterior
    const previousActiveRepos = previousRepos.filter(repo => {
      const repoDate = new Date(repo.updated_at);
      const cutoffForActivity = new Date(cutoffDate);
      cutoffForActivity.setDate(cutoffForActivity.getDate() - 30); // 30 dias antes do período atual
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

  // Calcular dados do período atual com comparações
  const currentPeriodData: PeriodData = useMemo(() => {
    const now = new Date();
    
    const totalStars = filteredRepositories.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = filteredRepositories.reduce((sum, r) => sum + r.forks_count, 0);
    const totalIssues = filteredRepositories.reduce((sum, r) => sum + r.open_issues_count, 0);
    const totalSize = filteredRepositories.reduce((sum, r) => sum + r.size, 0); // em KB

    // Calcular repos ativos no período com base em commits e atualizações reais
    const cutoffDate = getDateRangeFilter(timeRange);
    const activeRepos = filteredRepositories.filter(repo => {
      if (!cutoffDate) {
        // Para "ALL", considera ativos se atualizados nos últimos 30 dias
        const lastUpdate = new Date(repo.updated_at);
        const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 30;
      } else {
        // Para outros períodos, verifica se houve atividade real no período
        const lastUpdate = new Date(repo.updated_at);
        const pushedAt = new Date(repo.pushed_at || repo.updated_at);
        
        // Considera ativo se teve push ou atualização no período
        return lastUpdate >= cutoffDate || pushedAt >= cutoffDate;
      }
    }).length;

    // Calcular commits reais do período - CORREÇÃO: usar todos os commits se não há filtro de data
    let commitsInPeriod = 0;
    if (commits && commits.length > 0) {
      if (!cutoffDate) {
        // Para "ALL", mostrar total de commits disponíveis
        commitsInPeriod = commits.length;
      } else {
        // Para períodos específicos, filtrar por data
        commitsInPeriod = commits.filter(commit => {
          try {
            const commitDate = new Date(commit.commit.author.date);
            return commitDate >= cutoffDate;
          } catch (error) {
            console.warn('Erro ao processar data do commit:', error);
            return false;
          }
        }).length;
      }
    }

    // Calcular taxas de crescimento baseadas em dados reais
    const calculateGrowthRate = (current: number, previous: number): string => {
      if (!previous || previous === 0) {
        return current > 0 ? '+∞%' : '0%';
      }
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
      // Para "ALL", calcular crescimento baseado em dados históricos reais
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const reposLastYear = repositories.filter(repo => 
        new Date(repo.created_at) <= oneYearAgo
      );
      
      const starsLastYear = reposLastYear.reduce((sum, r) => sum + r.stargazers_count, 0);
      const forksLastYear = reposLastYear.reduce((sum, r) => sum + r.forks_count, 0);
      
      // Calcular crescimento anual real
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
      totalSize: Math.round(totalSize / 1024), // Converter para MB
      starsGrowthRate,
      forksGrowthRate,
      reposGrowthRate,
    };
  }, [filteredRepositories, commits, previousPeriodData, timeRange, repositories]);

  // Estatísticas totais (sempre consideram todos os repositórios) - CORREÇÃO: usar todos os repos
  const totalStats = useMemo(() => {
    if (!repositories.length) return null;

    const now = new Date();
    const totalStars = repositories.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, r) => sum + r.forks_count, 0);
    const totalWatchers = repositories.reduce((sum, r) => sum + r.watchers_count, 0);
    const totalIssues = repositories.reduce((sum, r) => sum + r.open_issues_count, 0);
    const totalSize = repositories.reduce((sum, r) => sum + r.size, 0);

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

    console.log('Total Stats - Repositórios:', repositories.length, 'Stars:', totalStars, 'Média:', avgStars.toFixed(1));

    return {
      totalRepos: repositories.length,
      totalStars,
      totalForks,
      totalWatchers,
      totalIssues,
      totalSize: (totalSize / 1024).toFixed(1),
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
        size: repo.size,
        age: Math.round(age),
        lastUpdate: repo.updated_at,
        language: repo.language || 'Unknown',
        activity: Math.max(0, 100 - lastUpdateDays),
      };
    });
  }, [filteredRepositories]);

  // Verificar se há dados suficientes para mostrar a matriz de performance
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

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#EC4899', '#84CC16'];

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
          {/* Selector de período */}
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

          {/* Botão Atualizar */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>

          {/* Saudação usuário */}
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

      {/* Cards com estatísticas do período atual */}
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

        {/* Card para tamanho total dos repositórios */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-400 text-sm font-medium mb-1">Tamanho Total</p>
              <p className="text-3xl font-bold text-white">{currentPeriodData.totalSize} MB</p>
              <div className="flex items-center space-x-1 text-orange-400">
                <Gauge className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {timeRange === 'ALL' ? 'Todos repos' : 'No período'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Gauge className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Card separado para commits e debug info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card customizado para commits reais */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/20 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-400 text-sm font-medium mb-1">Commits</p>
              <p className="text-3xl font-bold text-white">{currentPeriodData.commits}</p>
              <div className="flex items-center space-x-1 text-green-400">
                <GitCommit className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {timeRange === 'ALL' ? 'Total disponível' : 'No período'}
                </span>
              </div>
              {/* Debug info */}
              <div className="text-xs text-slate-500 mt-1">
                Debug: {commits?.length || 0} commits carregados
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <GitCommit className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Debug Card - Informações dos repositórios */}
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

        {/* Card de Resumo Rápido */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-400 text-sm font-medium mb-1">Resumo Rápido</p>
              <p className="text-lg font-bold text-white">Visão Geral</p>
              <div className="text-xs text-slate-400 space-y-1">
                <div>★ {currentPeriodData.stars} stars</div>
                <div>🍴 {currentPeriodData.forks} forks</div>
                <div>📦 {currentPeriodData.totalSize} MB</div>
                <div>⚡ {currentPeriodData.activeRepos} ativos</div>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Linha adicional de estatísticas totais */}
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
              <Layers className="w-8 h-8 text-purple-500" />
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

      {/* Grade com gráficos principais */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Linha do tempo de atividade */}
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

        {/* Distribuição de Linguagens */}
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
                    <p className="text-slate-400 text-xs">{lang.avgStars.toFixed(1)} ★ avg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Matriz de performance dos repositórios - Só mostra se há dados relevantes */}
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
              />
              <YAxis
                type="number"
                dataKey="forks"
                name="Forks"
                stroke="#9CA3AF"
                label={{ value: 'Forks', angle: -90, position: 'insideLeft' }}
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
                        <p className="text-orange-400">📦 {(data.size / 1024).toFixed(1)} MB</p>
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
          
          {/* Legenda explicativa */}
          <div className="mt-4 text-sm text-slate-400">
            <p>💡 <strong>Dica:</strong> Cada ponto representa um repositório. O tamanho indica a atividade (última atualização).</p>
          </div>
        </div>
      )}

      {/* Mensagem quando não há dados suficientes para matriz */}
      {!hasPerformanceData && filteredRepositories.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="text-center py-8">
            <Gauge className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">Matriz de Performance Indisponível</h3>
            <p className="text-slate-500 mb-4">
              Não há dados suficientes para gerar a matriz de performance.
            </p>
            <div className="text-sm text-slate-400 bg-slate-700/30 rounded-lg p-4 max-w-md mx-auto">
              <p className="mb-2"><strong>Para visualizar a matriz, você precisa de:</strong></p>
              <ul className="text-left space-y-1">
                <li>• 3+ repositórios com stars, ou</li>
                <li>• 2+ repositórios com forks, ou</li>
                <li>• Atividade recente significativa</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Feed de atividade recente */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-400" />
          Atividade Recente Detalhada
        </h3>
        <div className="grid gap-4 max-h-[480px] overflow-y-auto">
          {filteredRepositories
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 10)
            .map(repo => {
              const daysSinceUpdate = Math.floor(
                (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24)
              );
              const isRecent = daysSinceUpdate <= 7;

              return (
                <div
                  key={repo.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    isRecent
                      ? 'bg-blue-900/20 border-blue-500/30'
                      : 'bg-slate-700/30 border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isRecent ? 'bg-green-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    <div>
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        {repo.name}
                        {repo.private && <Lock className="w-4 h-4 text-red-400" />}
                        {isRecent && <Zap className="w-4 h-4 text-yellow-400" />}
                      </h4>
                      <p className="text-sm text-slate-400">{repo.description || 'Sem descrição'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-4 text-sm text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitCommit className="w-4 h-4 text-blue-400" />
                        {repo.forks_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-purple-400" />
                        {repo.watchers_count}
                      </span>
                      {repo.language && (
                        <span className="bg-slate-600 px-2 py-1 rounded text-xs">{repo.language}</span>
                      )}
                    </div>
                    <span className={`text-sm ${isRecent ? 'text-green-400' : 'text-slate-500'}`}>
                      {daysSinceUpdate === 0 ? 'Hoje' : `${daysSinceUpdate} dias atrás`}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
