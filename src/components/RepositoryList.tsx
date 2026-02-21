import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, GitBranch, Star, Eye, GitCommit, Lock, Unlock, ExternalLink, 
  Calendar, RefreshCw, Filter, BarChart3, Activity, Code2,
  Zap, AlertCircle, CheckCircle, Clock, Target, Layers,
  Database, Globe, Shield, Archive
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, AreaChart, Area
} from 'recharts';
import { useGitHub } from '../context/GitHubContext';
import { CHART_COLORS, CHART_SURFACE_COLORS, DEFAULT_TOOLTIP_STYLE } from '../constants/chartTheme';

type SortBy = 'updated' | 'created' | 'name' | 'stars' | 'forks' | 'size' | 'issues';
type FilterBy = 'all' | 'public' | 'private' | 'archived' | 'template';
type ViewMode = 'grid' | 'list' | 'analytics' | 'comparison';

interface RepositoryMetrics {
  id: number;
  name: string;
  stars: number;
  forks: number;
  watchers: number;
  issues: number;
  size: number;
  language: string | null;
  updated: string;
  activity: number;
  popularity: number;
  engagement: number;
  health: number;
}

interface LanguageMetrics {
  language: string;
  count: number;
  totalStars: number;
  totalSize: number;
  avgStars: number;
  avgSize: number;
  percentage: number;
}

interface ActivityMetrics {
  date: string;
  created: number;
  updated: number;
  totalRepos: number;
}

const RepositoryList: React.FC = () => {
  const { repositories, loading, fetchRepositories } = useGitHub();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('all');

  const memoizedFetchRepositories = useCallback(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  useEffect(() => {
    if (repositories.length === 0 && !loading) {
      memoizedFetchRepositories();
    }
  }, [repositories.length, loading, memoizedFetchRepositories]);

  const repositoryMetrics: RepositoryMetrics[] = useMemo(() => {
    if (!repositories.length) return [];
    const now = new Date();
    return repositories.map(repo => {
      const updated = new Date(repo.updated_at);
      const daysSinceUpdate = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
      const activity = Math.max(0, 100 - daysSinceUpdate * 2);
      const popularity = Math.min(100, (repo.stargazers_count + repo.forks_count) * 2);
      const engagement = repo.stargazers_count > 0 
        ? Math.min(100, (repo.watchers_count / repo.stargazers_count) * 100)
        : 0;
      const health = (activity + popularity + engagement) / 3;

      return {
        id: repo.id,
        name: repo.name,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        issues: repo.open_issues_count,
        size: repo.size,
        language: repo.language,
        updated: repo.updated_at,
        activity,
        popularity,
        engagement,
        health,
      };
    });
  }, [repositories]);

  const languageMetrics: LanguageMetrics[] = useMemo(() => {
    if (!repositories.length) return [];
    const languageMap = new Map<string, { count: number; totalStars: number; totalSize: number }>();
    repositories.forEach(repo => {
      const lang = repo.language || 'Unknown';
      const current = languageMap.get(lang) || { count: 0, totalStars: 0, totalSize: 0 };
      languageMap.set(lang, {
        count: current.count + 1,
        totalStars: current.totalStars + repo.stargazers_count,
        totalSize: current.totalSize + repo.size,
      });
    });

    const total = repositories.length;
    return Array.from(languageMap.entries())
      .map(([language, data]) => ({
        language,
        count: data.count,
        totalStars: data.totalStars,
        totalSize: data.totalSize,
        avgStars: data.totalStars / data.count,
        avgSize: data.totalSize / data.count,
        percentage: (data.count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [repositories]);

  const activityMetrics: ActivityMetrics[] = useMemo(() => {
    if (!repositories.length) return [];
    const monthlyData = new Map<string, { created: number; updated: number }>();
    repositories.forEach(repo => {
      const createdMonth = new Date(repo.created_at).toISOString().slice(0, 7);
      const updatedMonth = new Date(repo.updated_at).toISOString().slice(0, 7);
      const createdData = monthlyData.get(createdMonth) || { created: 0, updated: 0 };
      monthlyData.set(createdMonth, { ...createdData, created: createdData.created + 1 });
      const updatedData = monthlyData.get(updatedMonth) || { created: 0, updated: 0 };
      monthlyData.set(updatedMonth, { ...updatedData, updated: updatedData.updated + 1 });
    });

    return Array.from(monthlyData.entries())
      .map(([date, data]) => ({
        date,
        created: data.created,
        updated: data.updated,
        totalRepos: repositories.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-12);
  }, [repositories]);

  const filteredRepositories = useMemo(() => {
    return repositories.filter(repo => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = repo.name.toLowerCase().includes(searchTermLower) ||
        (repo.description || '').toLowerCase().includes(searchTermLower) ||
        (repo.language || '').toLowerCase().includes(searchTermLower);
      if (!matchesSearch) return false;

      const matchesVisibility = filterBy === 'all' ||
        (filterBy === 'public' && !repo.private) ||
        (filterBy === 'private' && repo.private) ||
        (filterBy === 'archived' && repo.archived) ||
        (filterBy === 'template' && repo.is_template);
      if (!matchesVisibility) return false;

      const matchesLanguage = languageFilter === 'all' || repo.language === languageFilter;
      if (!matchesLanguage) return false;

      if (dateRange !== 'all') {
        const now = new Date();
        const repoDate = new Date(repo.updated_at);
        const daysDiff = (now.getTime() - repoDate.getTime()) / (1000 * 60 * 60 * 24);

        switch (dateRange) {
          case 'week': return daysDiff <= 7;
          case 'month': return daysDiff <= 30;
          case 'quarter': return daysDiff <= 90;
          case 'year': return daysDiff <= 365;
          default: return true;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'forks':
          return b.forks_count - a.forks_count;
        case 'size':
          return b.size - a.size;
        case 'issues':
          return b.open_issues_count - a.open_issues_count;
        default:
          return 0;
      }
    });
  }, [repositories, searchTerm, sortBy, filterBy, languageFilter, dateRange]);

  const languages = useMemo(() => {
    return Array.from(new Set(repositories.map(r => r.language).filter(Boolean))).sort();
  }, [repositories]);

  const stats = useMemo(() => {
    if (!repositories.length) return {
      total: 0,
      totalStars: 0,
      totalForks: 0,
      totalSize: '0',
      avgStars: '0',
      publicRepos: 0,
      privateRepos: 0,
      archivedRepos: 0,
      templateRepos: 0,
      activeRepos: 0,
      inactiveRepos: 0,
    };

    const now = new Date();
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
    const totalSize = repositories.reduce((sum, repo) => sum + repo.size, 0);
    const avgStars = repositories.length > 0 ? totalStars / repositories.length : 0;

    const publicRepos = repositories.filter(repo => !repo.private).length;
    const privateRepos = repositories.length - publicRepos;
    const archivedRepos = repositories.filter(repo => repo.archived).length;
    const templateRepos = repositories.filter(repo => repo.is_template).length;

    const activeRepos = repositories.filter(repo => {
      const daysSinceUpdate = (now.getTime() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate <= 30;
    }).length;

    return {
      total: repositories.length,
      totalStars,
      totalForks,
      totalSize: (totalSize / 1024).toFixed(1),
      avgStars: avgStars.toFixed(1),
      publicRepos,
      privateRepos,
      archivedRepos,
      templateRepos,
      activeRepos,
      inactiveRepos: repositories.length - activeRepos,
    };
  }, [repositories]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h atrás`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} meses atrás`;
    return `${Math.floor(diffInSeconds / 31536000)} anos atrás`;
  };

  const getLanguageColor = (language: string | null) => {
    const colors: { [key: string]: string } = {
      'JavaScript': 'bg-yellow-400',
      'TypeScript': 'bg-blue-600',
      'Python': 'bg-green-500',
      'Java': 'bg-orange-500',
      'C++': 'bg-pink-500',
      'C#': 'bg-purple-500',
      'PHP': 'bg-indigo-500',
      'Ruby': 'bg-red-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-600',
      'Swift': 'bg-orange-400',
      'Kotlin': 'bg-purple-600',
      'Dart': 'bg-blue-400',
      'HTML': 'bg-orange-400',
      'CSS': 'bg-blue-500',
      'Vue': 'bg-green-600',
      'React': 'bg-blue-400',
    };
    return colors[language || ''] || 'bg-gray-500';
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-400';
    if (health >= 60) return 'text-yellow-400';
    if (health >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthIcon = (health: number) => {
    if (health >= 80) return CheckCircle;
    if (health >= 60) return Clock;
    return AlertCircle;
  };

  const toggleRepoSelection = (repoId: number) => {
    setSelectedRepos(prev =>
      prev.includes(repoId)
        ? prev.filter(id => id !== repoId)
        : [...prev, repoId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <GitBranch className="w-10 h-10 text-blue-500" />
            Repositórios Avançados
          </h1>
          <p className="text-slate-400">
            {filteredRepositories.length} de {repositories.length} repositórios • {stats.totalStars} ★ total
          </p>
        </div>

        {/* Controles de visualização e atualização */}
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 rounded-lg p-1">
            {(['grid', 'list', 'analytics', 'comparison'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                aria-pressed={viewMode === mode}
                aria-label={`Modo de visualização ${mode}`}
              >
                {mode === 'grid' && 'Grade'}
                {mode === 'list' && 'Lista'}
                {mode === 'analytics' && 'Analytics'}
                {mode === 'comparison' && 'Comparar'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchRepositories}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-200"
            aria-label="Atualizar repositórios"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Total */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Database className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        {/* Públicos */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Públicos</p>
              <p className="text-2xl font-bold text-white">{stats.publicRepos}</p>
            </div>
            <Globe className="w-6 h-6 text-green-500" />
          </div>
        </div>
        {/* Privados */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Privados</p>
              <p className="text-2xl font-bold text-white">{stats.privateRepos}</p>
            </div>
            <Shield className="w-6 h-6 text-red-500" />
          </div>
        </div>
        {/* Ativos */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Ativos</p>
              <p className="text-2xl font-bold text-white">{stats.activeRepos}</p>
            </div>
            <Zap className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
        {/* Stars Médio */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Stars Médio</p>
              <p className="text-2xl font-bold text-white">{stats.avgStars}</p>
            </div>
            <Star className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        {/* Tamanho */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Tamanho</p>
              <p className="text-2xl font-bold text-white">{stats.totalSize}MB</p>
            </div>
            <Archive className="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Conteúdo modo Analytics */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Distribuição de Linguagens */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Code2 className="w-5 h-5 mr-2 text-blue-400" />
              Distribuição de Linguagens
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageMetrics.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ language, percentage }) => `${language} ${percentage.toFixed(1)}%`}
                >
                  {languageMetrics.slice(0, 8).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Atividade dos Repositórios */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-400" />
              Atividade dos Repositórios
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_SURFACE_COLORS.grid} />
                <XAxis dataKey="date" stroke={CHART_SURFACE_COLORS.axis} fontSize={12} />
                <YAxis stroke={CHART_SURFACE_COLORS.axis} fontSize={12} />
                <Tooltip contentStyle={DEFAULT_TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="created" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="updated" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Matriz de Saúde dos Repositórios */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-400" />
              Matriz de Saúde dos Repositórios
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={repositoryMetrics.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_SURFACE_COLORS.grid} />
                <XAxis 
                  type="number" 
                  dataKey="stars" 
                  name="Stars" 
                  stroke={CHART_SURFACE_COLORS.axis}
                  label={{ value: 'Stars', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="health" 
                  name="Saúde" 
                  stroke={CHART_SURFACE_COLORS.axis}
                  label={{ value: 'Saúde (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 shadow-lg">
                          <p className="text-white font-semibold">{data.name}</p>
                          <p className="text-yellow-400">★ {data.stars} stars</p>
                          <p className="text-green-400">🍴 {data.forks} forks</p>
                          <p className="text-purple-400">💪 {data.health.toFixed(1)}% saúde</p>
                          <p className="text-blue-400">📊 {data.activity.toFixed(1)}% atividade</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter dataKey="health" fill="#8B5CF6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Performance por Linguagem */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-orange-400" />
              Performance por Linguagem
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={languageMetrics.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_SURFACE_COLORS.grid} />
                <XAxis dataKey="language" stroke={CHART_SURFACE_COLORS.axis} fontSize={12} />
                <YAxis stroke={CHART_SURFACE_COLORS.axis} fontSize={12} />
                <Tooltip contentStyle={DEFAULT_TOOLTIP_STYLE} />
                <Bar dataKey="totalStars" fill="#3B82F6" name="Total Stars" />
                <Bar dataKey="avgStars" fill="#10B981" name="Média Stars" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Filtros e Busca</h3>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            aria-expanded={showAdvancedFilters}
            aria-controls="advanced-filters"
          >
            <Filter className="w-4 h-4" />
            Filtros Avançados
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar repositórios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              aria-label="Pesquisar repositórios"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            aria-label="Ordenar repositórios"
          >
            <option value="updated">Última atualização</option>
            <option value="created">Data de criação</option>
            <option value="name">Nome</option>
            <option value="stars">Mais estrelas</option>
            <option value="forks">Mais forks</option>
            <option value="size">Tamanho</option>
            <option value="issues">Issues abertas</option>
          </select>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            aria-label="Filtrar por visibilidade"
          >
            <option value="all">Todos</option>
            <option value="public">Públicos</option>
            <option value="private">Privados</option>
            <option value="archived">Arquivados</option>
            <option value="template">Templates</option>
          </select>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            aria-label="Filtrar por linguagem"
          >
            <option value="all">Todas as linguagens</option>
            {languages.map(lang => (
              <option key={lang} value={lang || ''}>{lang}</option>
            ))}
          </select>
        </div>

        {showAdvancedFilters && (
          <div id="advanced-filters" className="mt-4 pt-4 border-t border-slate-600" aria-live="polite">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="date-range">
                  Período de Atividade
                </label>
                <select
                  id="date-range"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'quarter' | 'year' | 'all')}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Selecionar período de atividade"
                >
                  <option value="all">Todos os períodos</option>
                  <option value="week">Última semana</option>
                  <option value="month">Último mês</option>
                  <option value="quarter">Último trimestre</option>
                  <option value="year">Último ano</option>
                </select>
              </div>

              {selectedRepos.length > 0 && (
                <div className="flex items-end">
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-400 text-sm font-medium">
                      {selectedRepos.length} repositório(s) selecionado(s)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {loading && repositories.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Carregando repositórios avançados...</p>
          </div>
        </div>
      ) : filteredRepositories.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredRepositories.map((repo) => {
            const metrics = repositoryMetrics.find(m => m.id === repo.id);
            const HealthIcon = getHealthIcon(metrics?.health || 0);
            const isSelected = selectedRepos.includes(repo.id);

            return (
              <div
                key={repo.id}
                className={`group bg-slate-800/50 backdrop-blur-sm border rounded-xl p-6 hover:border-blue-300/50 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                  isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700'
                } ${viewMode === 'list' ? 'flex items-center space-x-6' : ''}`}
                onClick={() => toggleRepoSelection(repo.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleRepoSelection(repo.id);
                  }
                }}
                aria-pressed={isSelected}
                aria-label={`Selecionar repositório ${repo.name}`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Cabeçalho do card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors truncate">
                            {repo.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {repo.private ? (
                              <Lock className="w-4 h-4 text-red-400" />
                            ) : (
                              <Unlock className="w-4 h-4 text-green-400" />
                            )}
                            {repo.archived && <Archive className="w-4 h-4 text-gray-400" />}
                            {repo.is_template && <Layers className="w-4 h-4 text-purple-400" />}
                          </div>
                        </div>
                        {repo.description && (
                          <p className="text-slate-300 text-sm mb-3 line-clamp-2">{repo.description}</p>
                        )}
                      </div>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors ml-2"
                        onClick={e => e.stopPropagation()}
                        aria-label={`Abrir ${repo.name} no GitHub`}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>

                    {/* Métricas resumidas */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-medium">{repo.stargazers_count}</span>
                        <span className="text-slate-400">stars</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <GitCommit className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">{repo.forks_count}</span>
                        <span className="text-slate-400">forks</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-medium">{repo.watchers_count}</span>
                        <span className="text-slate-400">watchers</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-white font-medium">{repo.open_issues_count}</span>
                        <span className="text-slate-400">issues</span>
                      </div>
                    </div>

                    {/* Linguagem e saúde */}
                    <div className="flex items-center justify-between mb-4">
                      {repo.language && (
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 ${getLanguageColor(repo.language)} rounded-full`}></div>
                          <span className="text-sm font-medium text-slate-300">{repo.language}</span>
                        </div>
                      )}
                      {metrics && (
                        <div className="flex items-center gap-2">
                          <HealthIcon className={`w-4 h-4 ${getHealthColor(metrics.health)}`} />
                          <span className={`text-sm font-medium ${getHealthColor(metrics.health)}`}>
                            {metrics.health.toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Métricas avançadas */}
                    {metrics && (
                      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                        <div className="text-center">
                          <p className="text-slate-400">Atividade</p>
                          <p className="text-white font-semibold">{metrics.activity.toFixed(0)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Popularidade</p>
                          <p className="text-white font-semibold">{metrics.popularity.toFixed(0)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Engajamento</p>
                          <p className="text-white font-semibold">{metrics.engagement.toFixed(0)}%</p>
                        </div>
                      </div>
                    )}

                    {/* Datas de criação, atualização e tamanho */}
                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        <span>Criado: {formatDateTime(repo.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-green-400" />
                        <span>Atualizado: {getTimeAgo(repo.updated_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="w-3 h-3 text-purple-400" />
                        <span>Tamanho: {(repo.size / 1024).toFixed(1)} MB</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Visualização em lista simplificada */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-blue-400 hover:text-blue-300 transition-colors">
                          {repo.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {repo.private ? (
                            <Lock className="w-4 h-4 text-red-400" />
                          ) : (
                            <Unlock className="w-4 h-4 text-green-400" />
                          )}
                          {repo.language && (
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 ${getLanguageColor(repo.language)} rounded-full`}></div>
                              <span className="text-xs text-slate-400">{repo.language}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {repo.description && (
                        <p className="text-slate-300 text-sm mb-2 line-clamp-1">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Atualizado {getTimeAgo(repo.updated_at)}</span>
                        <span>{(repo.size / 1024).toFixed(1)} MB</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-medium">{repo.stargazers_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitCommit className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">{repo.forks_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-white font-medium">{repo.open_issues_count}</span>
                      </div>
                      {metrics && (
                        <div className="flex items-center gap-1">
                          <HealthIcon className={`w-4 h-4 ${getHealthColor(metrics.health)}`} />
                          <span className={`font-medium ${getHealthColor(metrics.health)}`}>
                            {metrics.health.toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      onClick={e => e.stopPropagation()}
                      aria-label={`Abrir ${repo.name} no GitHub`}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <GitBranch className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Nenhum repositório encontrado</h3>
          <p className="text-slate-500">
            {searchTerm ? 'Tente ajustar os filtros de busca' : 'Nenhum repositório corresponde aos filtros selecionados'}
          </p>
        </div>
      )}

      {viewMode === 'comparison' && selectedRepos.length > 1 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
            Comparação de Repositórios Selecionados
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-3 px-4 text-slate-300">Repositório</th>
                  <th className="text-center py-3 px-4 text-slate-300">Stars</th>
                  <th className="text-center py-3 px-4 text-slate-300">Forks</th>
                  <th className="text-center py-3 px-4 text-slate-300">Issues</th>
                  <th className="text-center py-3 px-4 text-slate-300">Tamanho</th>
                  <th className="text-center py-3 px-4 text-slate-300">Linguagem</th>
                </tr>
              </thead>
              <tbody>
                {selectedRepos.map(id => {
                  const repo = repositories.find(r => r.id === id);
                  if (!repo) return null;
                  return (
                    <tr key={id} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                      <td className="py-2 px-4 text-white">{repo.name}</td>
                      <td className="py-2 px-4 text-center text-white">{repo.stargazers_count}</td>
                      <td className="py-2 px-4 text-center text-white">{repo.forks_count}</td>
                      <td className="py-2 px-4 text-center text-white">{repo.open_issues_count}</td>
                      <td className="py-2 px-4 text-center text-white">{(repo.size / 1024).toFixed(1)} MB</td>
                      <td className="py-2 px-4 text-center text-white">{repo.language || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryList;
