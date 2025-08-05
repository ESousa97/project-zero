import React from 'react';
import { useGitHub } from '../../context/GitHubContext';

// Componentes modulares
import DashboardHeader from './DashboardHeader';
import TokenModalWrapper from './TokenModalWrapper';
import LoadingState from './LoadingState';
import StatsGrid from './StatsGrid';
import DashboardCharts from './DashboardCharts';

// Hook personalizado para dados do dashboard
import { useDashboardData } from './useDashboardData';

const Dashboard: React.FC = () => {
  const { token, user, loading, repositories } = useGitHub();

  const {
    currentPeriodData,
    totalStats,
    timeRange,
    setTimeRange,
    isRefreshing,
    handleRefresh,
    timeSeriesData,
    languageData,
    repositoryMetrics,
    selectedMetric,
    setSelectedMetric,
    hasPerformanceData,
  } = useDashboardData();

  // Exibe modal para solicitar token caso não tenha
  if (!token) {
    return <TokenModalWrapper token={token} user={user} />;
  }

  // Exibe loading enquanto carrega dados iniciais e não há repositórios
  if (loading && repositories.length === 0) {
    return <LoadingState loading={loading} hasRepositories={repositories.length > 0} />;
  }

  // Renderização principal do Dashboard
  return (
    <div className="space-y-6">
      {/* Cabeçalho do Dashboard com seleção de período e refresh */}
      <DashboardHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        user={user}
        activeRepos={currentPeriodData.activeRepos}
      />

      {/* Grid com principais estatísticas do período */}
      <StatsGrid
        currentPeriodData={currentPeriodData}
        totalStats={totalStats}
        timeRange={timeRange}
      />

      {/* Gráficos e métricas detalhadas */}
      <DashboardCharts
        timeSeriesData={timeSeriesData}
        languageData={languageData}
        repositoryMetrics={repositoryMetrics}
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        hasPerformanceData={hasPerformanceData}
      />
    </div>
  );
};

export default Dashboard;
