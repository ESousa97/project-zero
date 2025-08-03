import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { ViewType } from '../types/app';

// Componentes das views
import Dashboard from './Dashboard/Dashboard';
import RepositoryList from './RepositoryList';
import CommitHistory from './CommitHistory';
import UserProfile from './UserProfile';
import Settings from './Settings';

interface ViewRendererProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  darkMode?: boolean;
}

const ViewRenderer: React.FC<ViewRendererProps> = ({
  currentView,
  onViewChange,
  darkMode = true,
}) => {
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
        
      case 'repositories':
        return <RepositoryList />;
        
      case 'commits':
        return <CommitHistory />;
        
      case 'profile':
        return <UserProfile />;
        
      case 'settings':
        return <Settings />;
        
      case 'analytics':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Analytics Avançado
              </h3>
              <p className={`mb-4 ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Funcionalidade premium em desenvolvimento
              </p>
              <button 
                onClick={() => onViewChange('dashboard')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        );
        
      case 'insights':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Insights Avançados
              </h3>
              <p className={`mb-4 ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Análises detalhadas e insights personalizados
              </p>
              <button 
                onClick={() => onViewChange('dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        );
        
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
};

export default ViewRenderer;
