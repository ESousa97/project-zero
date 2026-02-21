// src/components/CommitHistory/CommitAnalytics.tsx
import React from 'react';
import { 
  GitCommit, User, Plus, Minus, Activity, Clock, Target
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import type { CommitAnalytics as CommitAnalyticsType } from './types';
import { CHART_COLORS, CHART_SURFACE_COLORS, DEFAULT_TOOLTIP_STYLE } from '../../constants/chartTheme';

interface CommitAnalyticsProps {
  analytics: CommitAnalyticsType;
}

const CommitAnalytics: React.FC<CommitAnalyticsProps> = ({ analytics }) => {
  // Preparar dados para gráficos
  const commitTypeData = Object.entries(analytics.commitFrequency).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  return (
    <>
      {/* Analytics Cards */}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Atividade Diária (Últimos 30 dias)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_SURFACE_COLORS.grid} />
              <XAxis dataKey="date" stroke={CHART_SURFACE_COLORS.axis} fontSize={12} />
              <YAxis stroke={CHART_SURFACE_COLORS.axis} fontSize={12} />
              <Tooltip contentStyle={DEFAULT_TOOLTIP_STYLE} />
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
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_SURFACE_COLORS.grid} />
              <XAxis dataKey="hour" stroke={CHART_SURFACE_COLORS.axis} fontSize={12} />
              <YAxis stroke={CHART_SURFACE_COLORS.axis} fontSize={12} />
              <Tooltip contentStyle={DEFAULT_TOOLTIP_STYLE} />
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
                    <div className="flex items-center gap-1 text-green-400">
                      <Plus className="w-3 h-3" />
                      <span>{stats.additions}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-400">
                      <Minus className="w-3 h-3" />
                      <span>{stats.deletions}</span>
                    </div>
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
                data={commitTypeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {commitTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default CommitAnalytics;