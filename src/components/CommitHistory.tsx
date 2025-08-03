import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  GitCommit, Calendar, User, ExternalLink, Search, Hash, Plus, Minus, 
  Clock, Code, FileText, Target, TrendingUp, BarChart3, Activity, MessageSquare, 
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { useGitHub } from '../context/GitHubContext';
import type { Commit } from '../types/github';

type TimeFilter = 'all' | 'hour' | 'day' | 'week' | 'month' | 'year';
type SortBy = 'date' | 'author' | 'additions' | 'deletions' | 'changes';
type ViewMode = 'list' | 'timeline' | 'analytics';
type CommitType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | 'other';

interface CommitAnalytics {
  totalCommits: number;
  totalAuthors: number;
  totalAdditions: number;
  totalDeletions: number;
  avgCommitsPerDay: number;
  mostActiveAuthor: string;
  mostActiveDay: string;
  commitFrequency: { [key: string]: number };
  authorStats: { [key: string]: { commits: number; additions: number; deletions: number } };
  timeDistribution: { hour: number; count: number }[];
  dailyActivity: { date: string; commits: number; additions: number; deletions: number }[];
}

interface ExtendedCommit extends Commit {
  filesChanged?: number;
  linesChanged?: number;
  commitType?: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | 'other';
  messageLength?: number;
  dayOfWeek?: string;
  timeOfDay?: number;
}

const CommitHistory: React.FC = () => {
  const { repositories, commits, loading, fetchCommits } = useGitHub();
  
  // Estados do componente
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Memoizar fetchCommits para usar no useEffect
  const memoizedFetchCommits = useCallback((repo: string, branch: string) => {
    fetchCommits(repo, branch);
  }, [fetchCommits]);

  // Otimizar useEffect para fetchCommits
  useEffect(() => {
    if (selectedRepo && selectedBranch && !loading) {
      const timeoutId = setTimeout(() => {
        memoizedFetchCommits(selectedRepo, selectedBranch);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedRepo, selectedBranch, loading, memoizedFetchCommits]);

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

      return {
        ...commit,
        commitType,
        messageLength: message.length,
        dayOfWeek: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
        timeOfDay: date.getHours(),
        filesChanged: commit.stats?.total || 0,
        linesChanged: (commit.stats?.additions || 0) + (commit.stats?.deletions || 0)
      };
    });
  }, [commits]);

  // Memoizar analytics
  const analytics: CommitAnalytics = useMemo(() => {
    if (!extendedCommits.length) return {
      totalCommits: 0,
      totalAuthors: 0,
      totalAdditions: 0,
      totalDeletions: 0,
      avgCommitsPerDay: 0,
      mostActiveAuthor: '',
      mostActiveDay: '',
      commitFrequency: {},
      authorStats: {},
      timeDistribution: [],
      dailyActivity: []
    };

    const authorStats: { [key: string]: { commits: number; additions: number; deletions: number } } = {};
    const dailyStats: { [key: string]: { commits: number; additions: number; deletions: number } } = {};
    const hourStats: { [key: number]: number } = {};
    const dayStats: { [key: string]: number } = {};

    let totalAdditions = 0;
    let totalDeletions = 0;

    extendedCommits.forEach(commit => {
      const author = commit.commit.author.name;
      const date = new Date(commit.commit.author.date);
      const dateKey = date.toISOString().split('T')[0];
      const hour = date.getHours();
      const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });

      // Estatísticas por autor
      if (!authorStats[author]) {
        authorStats[author] = { commits: 0, additions: 0, deletions: 0 };
      }
      authorStats[author].commits += 1;
      authorStats[author].additions += commit.stats?.additions || 0;
      authorStats[author].deletions += commit.stats?.deletions || 0;

      // Estatísticas diárias
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { commits: 0, additions: 0, deletions: 0 };
      }
      dailyStats[dateKey].commits += 1;
      dailyStats[dateKey].additions += commit.stats?.additions || 0;
      dailyStats[dateKey].deletions += commit.stats?.deletions || 0;

      // Estatísticas por hora
      hourStats[hour] = (hourStats[hour] || 0) + 1;

      // Estatísticas por dia da semana
      dayStats[dayOfWeek] = (dayStats[dayOfWeek] || 0) + 1;

      totalAdditions += commit.stats?.additions || 0;
      totalDeletions += commit.stats?.deletions || 0;
    });

    const mostActiveAuthor = Object.entries(authorStats)
      .sort((a, b) => b[1].commits - a[1].commits)[0]?.[0] || '';

    const mostActiveDay = Object.entries(dayStats)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    const timeDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourStats[hour] || 0
    }));

    const dailyActivity = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        commits: stats.commits,
        additions: stats.additions,
        deletions: stats.deletions
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Últimos 30 dias

    const dayRange = dailyActivity.length > 0 ? dailyActivity.length : 1;
    const avgCommitsPerDay = extendedCommits.length / dayRange;

    return {
      totalCommits: extendedCommits.length,
      totalAuthors: Object.keys(authorStats).length,
      totalAdditions,
      totalDeletions,
      avgCommitsPerDay,
      mostActiveAuthor,
      mostActiveDay,
      commitFrequency: dayStats,
      authorStats,
      timeDistribution,
      dailyActivity
    };
  }, [extendedCommits]);

  // Memoizar filteredCommits
  const filteredCommits = useMemo(() => {
    let filtered = [...extendedCommits];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(commit => 
        commit.commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commit.commit.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commit.sha.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por autor
    if (selectedAuthor !== 'all') {
      filtered = filtered.filter(commit => commit.commit.author.name === selectedAuthor);
    }

    // Filtro de tempo
    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(commit => {
        const commitDate = new Date(commit.commit.author.date);
        const diffInHours = (now.getTime() - commitDate.getTime()) / (1000 * 60 * 60);
        
        switch (timeFilter) {
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
      switch (sortBy) {
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
  }, [extendedCommits, searchTerm, selectedAuthor, timeFilter, sortBy]);

  // Memoizar uniqueAuthors
  const uniqueAuthors = useMemo(() => {
    return [...new Set(extendedCommits.map(commit => commit.commit.author.name))].sort();
  }, [extendedCommits]);

  // Funções utilitárias
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

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

  const getCommitTypeColor = (type: CommitType | undefined) => {
    const colors = {
      feat: 'bg-green-500',
      fix: 'bg-red-500',
      docs: 'bg-blue-500',
      style: 'bg-purple-500',
      refactor: 'bg-yellow-500',
      test: 'bg-orange-500',
      chore: 'bg-gray-500',
      other: 'bg-slate-500'
    };
    return colors[type || 'other'];
  };

  const getCommitTypeLabel = (type: CommitType | undefined) => {
    const labels = {
      feat: 'FEAT',
      fix: 'FIX',
      docs: 'DOCS',
      style: 'STYLE',
      refactor: 'REFACTOR',
      test: 'TEST',
      chore: 'CHORE',
      other: 'OTHER'
    };
    return labels[type || 'other'];
  };

  const handleRepoChange = (repoFullName: string) => {
    setSelectedRepo(repoFullName);
  };

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#F97316'];

  return (
    <div className="space-y-6">
      {/* Header Aprimorado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <GitCommit className="w-10 h-10 text-green-500" />
            Histórico de Commits Detalhado
          </h1>
          <p className="text-slate-400">
            Análise completa de commits com métricas avançadas e visualizações interativas
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-800 rounded-lg p-1">
          {(['list', 'timeline', 'analytics'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {mode === 'list' && 'Lista'}
              {mode === 'timeline' && 'Timeline'}
              {mode === 'analytics' && 'Analytics'}
            </button>
          ))}
        </div>
      </div>

      {/* Seleção de Repositório e Branch */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Repositório
            </label>
            <select
              value={selectedRepo}
              onChange={(e) => handleRepoChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Selecione um repositório</option>
              {repositories.map(repo => (
                <option key={repo.id} value={repo.full_name}>
                  {repo.name} ({repo.default_branch})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
              disabled={!selectedRepo}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="main">main</option>
              <option value="master">master</option>
              <option value="develop">develop</option>
              <option value="dev">dev</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Autor
            </label>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">Todos os autores</option>
              {uniqueAuthors.map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => selectedRepo && fetchCommits(selectedRepo, selectedBranch)}
              disabled={!selectedRepo || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Carregando...
                </>
              ) : (
                'Buscar Commits'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && analytics.totalCommits > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Total de Commits</p>
                <p className="text-3xl font-bold text-white">{analytics.totalCommits}</p>
                <p className="text-green-400 text-sm">{analytics.avgCommitsPerDay.toFixed(1)} por dia</p>
              </div>
              <GitCommit className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Contribuidores</p>
                <p className="text-3xl font-bold text-white">{analytics.totalAuthors}</p>
                <p className="text-purple-400 text-sm truncate">{analytics.mostActiveAuthor}</p>
              </div>
              <User className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Linhas Adicionadas</p>
                <p className="text-3xl font-bold text-white">{analytics.totalAdditions.toLocaleString()}</p>
                <p className="text-green-400 text-sm">+{(analytics.totalAdditions / analytics.totalCommits).toFixed(0)} por commit</p>
              </div>
              <Plus className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Linhas Removidas</p>
                <p className="text-3xl font-bold text-white">{analytics.totalDeletions.toLocaleString()}</p>
                <p className="text-red-400 text-sm">-{(analytics.totalDeletions / analytics.totalCommits).toFixed(0)} por commit</p>
              </div>
              <Minus className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Gráficos de Analytics */}
      {analytics.totalCommits > 0 && viewMode === 'analytics' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Daily Activity */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              Atividade Diária (Últimos 30 dias)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="commits" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="additions" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="deletions" stackId="3" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Time Distribution */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-400" />
              Distribuição por Hora do Dia
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Author Stats */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-400" />
              Estatísticas por Autor
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {Object.entries(analytics.authorStats)
                .sort((a, b) => b[1].commits - a[1].commits)
                .slice(0, 10)
                .map(([author, stats], index) => (
                  <div key={author} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{author}</p>
                        <p className="text-sm text-slate-400">{stats.commits} commits</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-green-400">+{stats.additions}</p>
                      <p className="text-red-400">-{stats.deletions}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Commit Types Distribution */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2 text-yellow-400" />
              Tipos de Commit
            </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(
                      extendedCommits.reduce((acc, commit) => {
                        const type: CommitType = commit.commitType || 'other';
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                      }, {} as Record<CommitType, number>)
                    ).map(([type, count]) => ({
                      name: getCommitTypeLabel(type as CommitType),
                      value: count,
                      type: type as CommitType,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.keys(analytics.authorStats).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filtros Avançados */}
      {commits.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar commits, autores, SHA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">Todos os períodos</option>
              <option value="hour">Última hora</option>
              <option value="day">Último dia</option>
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
              <option value="year">Último ano</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="date">Data</option>
              <option value="author">Autor</option>
              <option value="additions">Adições</option>
              <option value="deletions">Remoções</option>
              <option value="changes">Total de mudanças</option>
            </select>

            {/* Analytics Toggle */}
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                showAnalytics 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>
      )}

      {/* Lista de Commits */}
      {loading && commits.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Carregando commits detalhados...</p>
          </div>
        </div>
      ) : filteredCommits.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              {filteredCommits.length} commits encontrados
            </h2>
            <div className="text-sm text-slate-400">
              Repositório: <span className="text-blue-400 font-medium">{selectedRepo}</span>
              {selectedBranch && (
                <span> • Branch: <span className="text-green-400 font-medium">{selectedBranch}</span></span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {filteredCommits.map((commit) => {
              const stats = commit.stats;
              
              return (
                <div key={commit.sha} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-300/50 transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {commit.author ? (
                        <img
                          src={commit.author.avatar_url}
                          alt={commit.author.login}
                          className="w-12 h-12 rounded-full border-2 border-slate-600 group-hover:border-blue-500 transition-colors"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Commit Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getCommitTypeColor(commit.commitType)}`}>
                          {getCommitTypeLabel(commit.commitType)}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1 break-words group-hover:text-blue-400 transition-colors">
                            {commit.commit.message.split('\n')[0]}
                          </h3>
                          {commit.commit.message.split('\n').length > 1 && (
                            <div className="text-slate-400 text-sm mt-2 whitespace-pre-wrap max-h-20 overflow-y-auto">
                              {commit.commit.message.split('\n').slice(1).join('\n').trim()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Commit Meta Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {/* Author Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-300 font-medium">
                              {commit.commit.author.name}
                            </span>
                            {commit.author && (
                              <span className="text-slate-500">
                                (@{commit.author.login})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Calendar className="w-4 h-4 text-green-400" />
                            <span>{formatDateTime(commit.commit.author.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-blue-400">
                            <Clock className="w-4 h-4" />
                            <span>{getTimeAgo(commit.commit.author.date)}</span>
                          </div>
                        </div>

                        {/* Commit Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Hash className="w-4 h-4 text-purple-400" />
                            <code className="bg-slate-700 px-2 py-1 rounded text-xs font-mono text-slate-300">
                              {commit.sha.substring(0, 8)}
                            </code>
                            <a
                              href={commit.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          
                          {stats && (
                            <>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-green-400">
                                  <Plus className="w-3 h-3" />
                                  <span>{stats.additions}</span>
                                </div>
                                <div className="flex items-center gap-1 text-red-400">
                                  <Minus className="w-3 h-3" />
                                  <span>{stats.deletions}</span>
                                </div>
                                <div className="text-slate-400">
                                  Total: {stats.total}
                                </div>
                              </div>
                              
                              {/* Progress bar for changes */}
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="flex h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-green-500" 
                                    style={{ width: `${(stats.additions / stats.total) * 100}%` }}
                                  />
                                  <div 
                                    className="bg-red-500" 
                                    style={{ width: `${(stats.deletions / stats.total) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Additional Metrics */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <MessageSquare className="w-4 h-4 text-orange-400" />
                            <span>{commit.messageLength} caracteres</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Calendar className="w-4 h-4 text-cyan-400" />
                            <span>{commit.dayOfWeek}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Clock className="w-4 h-4 text-pink-400" />
                            <span>{commit.timeOfDay}:00</span>
                          </div>
                        </div>
                      </div>

                      {/* Committer Info (se diferente do author) */}
                      {commit.commit.committer.email !== commit.commit.author.email && (
                        <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <GitCommit className="w-4 h-4 text-orange-400" />
                            <span>Committed by: </span>
                            <span className="text-slate-300 font-medium">
                              {commit.commit.committer.name}
                            </span>
                            <span className="text-slate-500">
                              em {formatDateTime(commit.commit.committer.date)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Advanced Metrics */}
                      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {commit.filesChanged || 0} arquivos
                        </span>
                        <span className="flex items-center gap-1">
                          <Code className="w-3 h-3" />
                          {commit.linesChanged || 0} linhas alteradas
                        </span>
                        {commit.stats && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Impacto: {commit.stats.total > 100 ? 'Alto' : commit.stats.total > 20 ? 'Médio' : 'Baixo'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : selectedRepo ? (
        <div className="text-center py-12">
          <GitCommit className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Nenhum commit encontrado</h3>
          <p className="text-slate-500">
            {searchTerm ? 'Tente ajustar os filtros de busca' : 'Este repositório não possui commits no branch selecionado'}
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <GitCommit className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Selecione um repositório</h3>
          <p className="text-slate-500">Escolha um repositório para visualizar o histórico detalhado de commits</p>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && filteredCommits.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Timeline de Commits
          </h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-600"></div>
            
            <div className="space-y-6">
              {filteredCommits.slice(0, 20).map((commit) => (
                <div key={commit.sha} className="relative flex items-start space-x-4">
                  {/* Timeline Dot */}
                  <div className={`relative z-10 w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center ${getCommitTypeColor(commit.commitType)}`}>
                    <GitCommit className="w-5 h-5 text-white" />
                  </div>
                  
                  {/* Timeline Content */}
                  <div className="flex-1 bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getCommitTypeColor(commit.commitType)}`}>
                            {getCommitTypeLabel(commit.commitType)}
                          </span>
                          <span className="text-slate-400 text-sm">
                            {getTimeAgo(commit.commit.author.date)}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-white mb-1">
                          {commit.commit.message.split('\n')[0]}
                        </h4>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {commit.commit.author.name}
                          </span>
                          
                          {commit.stats && (
                            <>
                              <span className="flex items-center gap-1 text-green-400">
                                <Plus className="w-3 h-3" />
                                {commit.stats.additions}
                              </span>
                              <span className="flex items-center gap-1 text-red-400">
                                <Minus className="w-3 h-3" />
                                {commit.stats.deletions}
                              </span>
                            </>
                          )}
                          
                          <code className="bg-slate-700 px-2 py-1 rounded text-xs">
                            {commit.sha.substring(0, 8)}
                          </code>
                        </div>
                      </div>
                      
                      <a
                        href={commit.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors ml-4"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitHistory;
