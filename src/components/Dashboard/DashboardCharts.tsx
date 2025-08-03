import React from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, ScatterChart, Scatter, Area
} from 'recharts';
import { TrendingUp, Code, Gauge } from 'lucide-react';

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

interface DashboardChartsProps {
  timeSeriesData: TimeSeriesData[];
  languageData: LanguageStats[];
  repositoryMetrics: RepositoryMetrics[];
  selectedMetric: 'commits' | 'stars' | 'forks' | 'issues';
  onMetricChange: (metric: 'commits' | 'stars' | 'forks' | 'issues') => void;
  hasPerformanceData: boolean;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({
  timeSeriesData,
  languageData,
  repositoryMetrics,
  selectedMetric,
  onMetricChange,
  hasPerformanceData
}) => {
  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#F97316'];

  return (
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
            onChange={(e) => onMetricChange(e.target.value as 'commits' | 'stars' | 'forks' | 'issues')}
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
                  <p className="text-slate-400 text-xs">{lang.avgStars.toFixed(1)} avg ★</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matriz de performance */}
      {hasPerformanceData && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 xl:col-span-2">
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

      {!hasPerformanceData && repositoryMetrics.length > 0 && (
        <div className="bg-slate-800/50 p-6 rounded-xl text-center text-slate-400 border border-slate-700 xl:col-span-2">
          <p>Nenhum dado suficiente para matriz de performance. Tente ampliar o período de análise ou atualizar os dados.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardCharts;
