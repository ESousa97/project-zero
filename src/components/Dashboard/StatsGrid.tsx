import React from 'react';
import { 
  GitBranch, Star, GitCommit, AlertCircle, Zap, HardDrive,
  Activity, Target, Globe, Shield
} from 'lucide-react';
import StatCard from '../StatCard';

interface StatsGridProps {
  currentPeriodData: {
    repositories: number;
    stars: number;
    forks: number;
    commits: number;
    issues: number;
    activeRepos: number;
    totalSize: number;
    starsGrowthRate: string;
    forksGrowthRate: string;
    reposGrowthRate: string;
  };
  totalStats: {
    total: number;
    totalStars: number;
    totalForks: number;
    totalSize: number;
    publicRepos: number;
    privateRepos: number;
    activeRepos: number;
    avgStars: string;
    mostPopularRepo: string;
    recentActivity: number;
  } | null;
  timeRange: string;
}

const StatsGrid: React.FC<StatsGridProps> = ({ 
  currentPeriodData, 
  totalStats, 
  timeRange 
}) => {
  return (
    <>
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
          trend="0%" 
        />
        <StatCard 
          title="Repositórios Ativos" 
          value={currentPeriodData.activeRepos} 
          icon={Zap} 
          color="purple" 
          trend="0%" 
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
                  {timeRange === 'ALL' ? 'Total estimado' : `Período: ${timeRange}`}
                </span>
              </div>
              {/* ADICIONADO: Indicador se são dados reais ou estimados */}
              <div className="mt-1">
                <span className="text-xs text-slate-500">
                  {currentPeriodData.commits > 0 ? 'Baseado em atividade real' : 'Dados não disponíveis'}
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
                <div>Período: {timeRange}</div>
                <div>Repos filtrados: {currentPeriodData.repositories}</div>
                <div>Commits calculados: {currentPeriodData.commits}</div>
                <div>Repos ativos: {currentPeriodData.activeRepos}</div>
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
              <Target className="w-8 h-8 text-yellow-500" />
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
                <Shield className="w-4 h-4 text-red-500" />
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
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatsGrid;
