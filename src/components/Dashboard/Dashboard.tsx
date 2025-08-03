import React from 'react';
import { useGitHub } from '../../context/GitHubContext';

// Componentes modulares
import DashboardHeader from './DashboardHeader';
import TokenModalWrapper from './TokenModalWrapper';
import LoadingState from './LoadingState';
import StatsGrid from './StatsGrid';
import DashboardCharts from './DashboardCharts';

// Hook personalizado
import { useDashboardData } from './useDashboardData';

const Dashboard: React.FC = () => {
  const { token } = useGitHub();
  
  const {
    // Data
    repositories,
    currentPeriodData,
    totalStats,
    languageData,
    timeSeriesData,
    repositoryMetrics,
    hasPerformanceData,
    user,
    loading,
    
    // State
    timeRange,
    selectedMetric,
    isRefreshing,
    
    // Actions
    setTimeRange,
    setSelectedMetric,
    handleRefresh,
  } = useDashboardData();

  // Renderiza modal de token se necessário
  if (!token) {
    return <TokenModalWrapper token={token} user={user} />;
  }

  // Renderiza loading se necessário
  if (loading && !repositories.length) {
    return <LoadingState loading={loading} hasRepositories={repositories.length > 0} />;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Dashboard */}
      <DashboardHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        user={user}
        activeRepos={currentPeriodData.activeRepos}
      />

      {/* Grid de Estatísticas */}
      <StatsGrid
        currentPeriodData={currentPeriodData}
        totalStats={totalStats}
        timeRange={timeRange}
      />

      {/* Gráficos e Métricas */}
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
