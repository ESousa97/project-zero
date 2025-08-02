import React, { useEffect, useState, useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, PieChart, Pie, Cell, BarChart, Bar,
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

  // Estatísticas avançadas calculadas
  const advancedStats = useMemo(() => {
    if (!repositories.length) return null;

    const now = new Date();
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
    const totalWatchers = repositories.reduce((sum, repo) => sum + repo.watchers_count, 0);
    const totalIssues = repositories.reduce((sum, repo) => sum + repo.open_issues_count, 0);
    const totalSize = repositories.reduce((sum, repo) => sum + repo.size, 0);

    const privateRepos = repositories.filter(repo => repo.private).length;
    const publicRepos = repositories.length - privateRepos;

    // Repositórios ativos (atualizados nos últimos 30 dias)
    const activeRepos = repositories.filter(repo => {
      const lastUpdate = new Date(repo.updated_at);
      const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 30;
    }).length;

    // Repositórios populares (com mais de 10 stars)
    const popularRepos = repositories.filter(repo => repo.stargazers_count >= 10).length;

    // Média de stars por repositório
    const avgStars = totalStars / repositories.length;

    // Repositório mais popular
    const mostPopularRepo = repositories.reduce((prev, current) =>
      prev.stargazers_count > current.stargazers_count ? prev : current
    );

    // Atividade recente (últimos 7 dias)
    const recentActivity = repositories.filter(repo => {
      const lastUpdate = new Date(repo.updated_at);
      const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7;
    }).length;

    return {
      totalRepos: repositories.length,
      totalStars,
      totalForks,
      totalWatchers,
      totalIssues,
      totalSize: (totalSize / 1024).toFixed(1), // Convert to MB
      privateRepos,
      publicRepos,
      activeRepos,
      popularRepos,
      avgStars: avgStars.toFixed(1),
      mostPopularRepo: mostPopularRepo.name,
      recentActivity,
      starsGrowthRate: '+12.5%', // Placeholder - would need historical data
      forksGrowthRate: '+8.3%',
      commitsThisMonth: commits.length || 0
    };
  }, [repositories, commits]);

  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value as 'commits' | 'stars' | 'forks' | 'issues';
  setSelectedMetric(value);
};

  // Dados para gráfico de linguagens com estatísticas avançadas
  const languageData: LanguageStats[] = useMemo(() => {
    const languageMap = new Map<string, { count: number; stars: number; repos: string[] }>();

    repositories.forEach(repo => {
      if (repo.language) {
        const current = languageMap.get(repo.language) || { count: 0, stars: 0, repos: [] };
        languageMap.set(repo.language, {
          count: current.count + 1,
          stars: current.stars + repo.stargazers_count,
          repos: [...current.repos, repo.name]
        });
      }
    });

    const total = repositories.length;
    return Array.from(languageMap.entries())
      .map(([language, data]) => ({
        language,
        count: data.count,
        percentage: (data.count / total) * 100,
        totalStars: data.stars,
        avgStars: data.stars / data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [repositories]);

  // Dados de série temporal para atividade
  const timeSeriesData: TimeSeriesData[] = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data: { [key: string]: TimeSeriesData } = {};

    repositories.forEach(repo => {
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
  }, [repositories]);

  // Métricas de repositórios para scatter plot
  const repositoryMetrics: RepositoryMetrics[] = useMemo(() => {
    return repositories.map(repo => {
      const created = new Date(repo.created_at);
      const updated = new Date(repo.updated_at);
      const age = (Date.now() - created.getTime()) / (1000 * 3600 * 24); // days
      const lastUpdateDays = (Date.now() - updated.getTime()) / (1000 * 3600 * 24);

      return {
        name: repo.name,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        commits: 0, // Would need to fetch from commits API
        issues: repo.open_issues_count,
        size: repo.size,
        age: Math.round(age),
        lastUpdate: repo.updated_at,
        language: repo.language || 'Unknown',
        activity: Math.max(0, 100 - lastUpdateDays) // Activity score based on recency
      };
    });
  }, [repositories]);

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
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando dados detalhados do GitHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-10 h-10 text-blue-500" />
            Dashboard Avançado
          </h1>
          <p className="text-slate-400">Análise completa e detalhada dos seus repositórios GitHub</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex bg-slate-800 rounded-lg p-1">
            {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
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
                {advancedStats?.recentActivity} repositórios ativos esta semana
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Stats Cards Grid */}
      {advancedStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total de Repositórios"
            value={advancedStats.totalRepos}
            icon={GitBranch}
            color="blue"
            trend="+12%"
          />
          <StatCard
            title="Total de Stars"
            value={advancedStats.totalStars}
            icon={Star}
            color="yellow"
            trend={advancedStats.starsGrowthRate}
          />
          <StatCard
            title="Total de Forks"
            value={advancedStats.totalForks}
            icon={GitCommit}
            color="green"
            trend={advancedStats.forksGrowthRate}
          />
          <StatCard
            title="Issues Abertas"
            value={advancedStats.totalIssues}
            icon={AlertCircle}
            color="red"
            trend="-5%"
          />
          <StatCard
            title="Repositórios Ativos"
            value={advancedStats.activeRepos}
            icon={Zap}
            color="purple"
            trend="+18%"
          />
          <StatCard
            title="Tamanho Total"
            value={parseFloat(advancedStats.totalSize)} // número puro
            icon={Gauge}
            color="blue"
            trend="+25%"
          />
          <p className="text-sm text-slate-400 ml-1">MB</p> {/* texto separado */}
        </div>
      )}

      {/* Additional Stats Row */}
      {advancedStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Média de Stars</p>
                <p className="text-2xl font-bold text-white">{advancedStats.avgStars}</p>
                <p className="text-green-400 text-sm">por repositório</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Mais Popular</p>
                <p className="text-lg font-bold text-white truncate">{advancedStats.mostPopularRepo}</p>
                <p className="text-blue-400 text-sm">repositório destaque</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Públicos vs Privados</p>
                <p className="text-2xl font-bold text-white">{advancedStats.publicRepos}:{advancedStats.privateRepos}</p>
                <p className="text-purple-400 text-sm">proporção</p>
              </div>
              <Layers className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Commits Este Mês</p>
                <p className="text-2xl font-bold text-white">{advancedStats.commitsThisMonth}</p>
                <p className="text-green-400 text-sm">+15% vs mês anterior</p>
              </div>
              <GitMerge className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Activity Timeline */}
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

        {/* Language Distribution with Advanced Stats */}
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

      {/* Repository Performance Matrix */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Gauge className="w-5 h-5 mr-2 text-purple-400" />
          Matriz de Performance dos Repositórios
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={repositoryMetrics}>
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
                      <p className="text-purple-400">📊 {data.activity}% atividade</p>
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
      </div>

      {/* Repository Activity Heatmap Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Repositories by Metrics */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-400" />
            Top Repositórios
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {repositoryMetrics
              .sort((a, b) => b.stars - a.stars)
              .slice(0, 8)
              .map((repo, index) => (
                <div
                  key={repo.name}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{repo.name}</h4>
                      <p className="text-sm text-slate-400">{repo.language}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4" />
                        {repo.stars}
                      </span>
                      <span className="flex items-center gap-1 text-blue-400">
                        <GitCommit className="w-4 h-4" />
                        {repo.forks}
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        <Activity className="w-4 h-4" />
                        {repo.activity}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{repo.age} dias</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Language Performance Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Code className="w-5 h-5 mr-2 text-green-400" />
            Performance por Linguagem
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={languageData.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="language" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="totalStars" fill="#3B82F6" name="Total Stars" />
              <Bar dataKey="count" fill="#10B981" name="Repositórios" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-400" />
          Atividade Recente Detalhada
        </h3>
        <div className="grid gap-4 max-h-[480px] overflow-y-auto">
          {repositories
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
