import React from 'react';

interface LoadingStateProps {
  loading: boolean;
  hasRepositories: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ loading, hasRepositories }) => {
  if (loading && !hasRepositories) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando dados detalhados do GitHub...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingState;
