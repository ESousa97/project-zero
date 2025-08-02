import React, { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { GitBranch, GitCommit, Star, Eye, TrendingUp, Calendar, Code } from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';
import StatCard from './StatCard';
import TokenModal from './TokenModal';

const Dashboard: React.FC = () => {
  const { repositories, user, token, loading, fetchRepositories, fetchUser } = useGitHub();
  const [showTokenModal, setShowTokenModal] = useState(false);

  useEffect(() => {
    if (!token) {
      setShowTokenModal(true);
    } else if (token && !user) {
      fetchUser();
      fetchRepositories();
    }
  }, [token, user, fetchUser, fetchRepositories]);

  // Estatísticas calculadas
  const stats = React.useMemo(() => {
    if (!repositories.length) return null;

    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
    const totalWatchers = repositories.reduce((sum, repo) => sum + repo.watchers_count, 0);
    const privateRepos = repositories.filter(repo => repo.private).length;
    const publicRepos = repositories.length - privateRepos;

    return {
      totalRepos: repositories.length,
      totalStars,
      totalForks,
      totalWatchers,
      privateRepos,
      publicRepos,
    };
  }, [repositories]);

  // Dados para gráficos
  const languageData = React.useMemo(() => {
    const languageCount: { [key: string]: number } = {};
    repositories.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    });

    return Object.entries(languageCount)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [repositories]);

  const activityData = React.useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyData: { [key: string]: number } = {};

    repositories.forEach(repo => {
      const date = new Date(repo.updated_at);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .map(([month, repos]) => ({ month, repos }))
      .slice(-12);
  }, [repositories]);

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#F97316'];

  if (!token) {
    return <TokenModal isOpen={showTokenModal} onClose={() => setShowTokenModal(false)} />;
  }

  if (loading && !repositories.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando dados do GitHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Visão geral dos seus repositórios e atividades</p>
        </div>
        {user && (
          <div className="text-right">
            <p className="text-white font-semibold">Bem-vindo, {user.name || user.login}!</p>
            <p className="text-slate-400 text-sm">Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Repositórios"
            value={stats.totalRepos}
            icon={GitBranch}
            color="blue"
            trend="+12%"
          />
          <StatCard
            title="Total de Stars"
            value={stats.totalStars}
            icon={Star}
            color="yellow"
            trend="+8%"
          />
          <StatCard
            title="Total de Forks"
            value={stats.totalForks}
            icon={GitCommit}
            color="green"
            trend="+15%"
          />
          <StatCard
            title="Watchers"
            value={stats.totalWatchers}
            icon={Eye}
            color="purple"
            trend="+5%"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Distribution */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Code className="w-5 h-5 mr-2 text-blue-400" />
            Linguagens Utilizadas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={languageData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={({ language, percent }: { language: string; percent: number }) => `${language} ${(percent * 100).toFixed(0)}%`}
              >
                {languageData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Repository Activity */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Atividade dos Repositórios
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="repos" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Repositories */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-purple-400" />
          Repositórios Recentes
        </h3>
        <div className="grid gap-4">
          {repositories.slice(0, 5).map(repo => (
            <div key={repo.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <div>
                  <h4 className="font-semibold text-white">{repo.name}</h4>
                  <p className="text-sm text-slate-400">{repo.description || 'Sem descrição'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                <span className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  {repo.stargazers_count}
                </span>
                <span className="flex items-center">
                  <GitCommit className="w-4 h-4 mr-1" />
                  {repo.forks_count}
                </span>
                <span>{new Date(repo.updated_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
