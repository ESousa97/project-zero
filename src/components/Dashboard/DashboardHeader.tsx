import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import type { User } from '../../types/github';

interface DashboardHeaderProps {
  timeRange: '1M' | '3M' | '6M' | '1Y' | 'ALL';
  onTimeRangeChange: (range: '1M' | '3M' | '6M' | '1Y' | 'ALL') => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  user: User | null;
  activeRepos: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  timeRange,
  onTimeRangeChange,
  isRefreshing,
  onRefresh,
  user,
  activeRepos
}) => {
  return (
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
              onClick={() => onTimeRangeChange(range)}
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
          onClick={onRefresh}
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
              {activeRepos} repositórios ativos no período
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
