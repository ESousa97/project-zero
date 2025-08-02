// src/main.tsx

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GitBranch, Settings, User, Activity } from 'lucide-react';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RepositoryList from './components/RepositoryList';
import CommitHistory from './components/CommitHistory';
import UserProfile from './components/UserProfile';
import SettingsPage from './components/Settings';

import { GitHubProvider } from './context/GitHubContext';

import './style.css';

// Define os tipos possíveis de visualização (views) da aplicação
type ViewType = 'dashboard' | 'repositories' | 'commits' | 'profile' | 'settings';

const App: React.FC = () => {
  // Estado para controlar a view atual exibida
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  // Estado para controlar se a sidebar está colapsada ou expandida
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Itens que aparecem no menu lateral com ícones associados
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'repositories', label: 'Repositórios', icon: GitBranch },
    { id: 'commits', label: 'Commits', icon: GitBranch },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  // Fix: Create proper handler for view change that accepts ViewType
  const handleViewChange = (view: string) => {
    setCurrentView(view as ViewType);
  };

  // Renderiza o conteúdo principal conforme a view atual
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
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <GitHubProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Cabeçalho fixo */}
        <Header />

        <div className="flex">
          {/* Sidebar com menu e controle de colapso */}
          <Sidebar
            menuItems={menuItems}
            currentView={currentView}
            onViewChange={handleViewChange}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Área principal de conteúdo, ajusta margin conforme sidebar */}
          <main
            className={`flex-1 transition-all duration-300 ${
              sidebarCollapsed ? 'ml-16' : 'ml-64'
            }`}
          >
            <div className="p-6">{renderContent()}</div>
          </main>
        </div>
      </div>
    </GitHubProvider>
  );
};

// Initialize React application
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container not found');
}

export default App;
