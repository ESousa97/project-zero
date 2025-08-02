import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  GitBranch, Settings, User, Activity, BarChart3, Search, 
  GitCommit, Database, Globe, Shield, Zap, Target, Coffee,
  Bell, Moon, Sun, Github, RefreshCw
} from 'lucide-react';

// Enhanced Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RepositoryList from './components/RepositoryList';
import CommitHistory from './components/CommitHistory';
import UserProfile from './components/UserProfile';
import SettingsPage from './components/Settings';

// Context Provider
import { GitHubProvider, useGitHub } from './context/GitHubContext';

// Styles
import './style.css';

// Enhanced view types
type ViewType = 'dashboard' | 'repositories' | 'commits' | 'profile' | 'settings' | 'analytics' | 'insights';

// Enhanced menu structure
interface MenuItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
  premium?: boolean;
}

// Notification system
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const AppContent: React.FC = () => {
  // Enhanced state management
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // GitHub context
  const { 
    user, 
    repositories, 
    loading, 
    error, 
    token,
    refreshAll,
    clearAllErrors 
  } = useGitHub();

  // Enhanced menu items with descriptions and badges
  const menuItems: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Activity, 
      description: 'Visão geral completa e métricas avançadas',
      badge: repositories.length > 0 ? 'NEW' : undefined
    },
    { 
      id: 'repositories', 
      label: 'Repositórios', 
      icon: GitBranch, 
      description: 'Gestão avançada de repositórios com analytics',
      badge: repositories.length.toString()
    },
    { 
      id: 'commits', 
      label: 'Commits', 
      icon: GitCommit, 
      description: 'Histórico detalhado de commits e análises'
    },
    { 
      id: 'profile', 
      label: 'Perfil', 
      icon: User, 
      description: 'Perfil avançado do desenvolvedor com insights'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      description: 'Análises profundas e relatórios detalhados',
      premium: true
    },
    { 
      id: 'settings', 
      label: 'Configurações', 
      icon: Settings, 
      description: 'Configurações avançadas e preferências'
    }
  ];

  // Handle view changes with analytics
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    
    // Add navigation analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: `GitVision - ${view}`,
        page_location: window.location.href
      });
    }
    
    // Clear any view-specific errors
    clearAllErrors();
  };

  // Enhanced notification system
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (isOnline && document.visibilityState === 'visible') {
        refreshAll().then(() => {
          setLastSync(new Date());
          addNotification({
            type: 'success',
            title: 'Dados Atualizados',
            message: 'Seus dados do GitHub foram sincronizados com sucesso'
          });
        }).catch(() => {
          addNotification({
            type: 'error',
            title: 'Erro na Sincronização',
            message: 'Não foi possível atualizar os dados. Tente novamente.'
          });
        });
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [token, refreshAll, isOnline]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addNotification({
        type: 'success',
        title: 'Conexão Restaurada',
        message: 'Você está online novamente!'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      addNotification({
        type: 'warning',
        title: 'Conexão Perdida',
        message: 'Você está offline. Algumas funcionalidades podem estar limitadas.'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Error handling with notifications
  useEffect(() => {
    if (error) {
      addNotification({
        type: 'error',
        title: 'Erro Detectado',
        message: error,
        action: {
          label: 'Tentar Novamente',
          onClick: () => {
            clearAllErrors();
            refreshAll();
          }
        }
      });
    }
  }, [error, clearAllErrors, refreshAll]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            handleViewChange('dashboard');
            break;
          case '2':
            event.preventDefault();
            handleViewChange('repositories');
            break;
          case '3':
            event.preventDefault();
            handleViewChange('commits');
            break;
          case '4':
            event.preventDefault();
            handleViewChange('profile');
            break;
          case 'r':
            event.preventDefault();
            refreshAll();
            break;
          case ',':
            event.preventDefault();
            handleViewChange('settings');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshAll]);

  // Render content based on current view
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
      case 'analytics':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Analytics Avançado</h3>
              <p className="text-slate-400 mb-4">
                Funcionalidade premium em desenvolvimento
              </p>
              <button 
                onClick={() => handleViewChange('dashboard')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        );
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {/* Enhanced Header */}
      <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        darkMode 
          ? 'bg-slate-800/95 border-slate-700' 
          : 'bg-white/95 border-gray-200'
      } backdrop-blur-sm`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Github className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    GitVision Pro
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Plataforma GitHub Avançada
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-slate-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Pesquisar repositórios, commits, usuários... (Ctrl+K)"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-200 ${
                    darkMode 
                      ? 'bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500' 
                      : 'bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 focus:border-transparent`}
                />
              </div>
            </div>

            {/* Right Menu */}
            <div className="flex items-center space-x-4">
              {/* Sync Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Refresh Button */}
              <button
                onClick={refreshAll}
                disabled={loading}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Atualizar dados (Ctrl+R)"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Alternar tema"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-lg transition-all duration-200 ${
                    darkMode 
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="Notificações"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-xl border z-50 ${
                    darkMode 
                      ? 'bg-slate-800 border-slate-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="p-4 border-b border-slate-700">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Notificações
                        </h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className={`text-sm ${
                              darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                            } transition-colors`}
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center">
                          <Bell className={`w-8 h-8 mx-auto mb-2 ${
                            darkMode ? 'text-slate-600' : 'text-gray-400'
                          }`} />
                          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            Nenhuma notificação
                          </p>
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b transition-all duration-200 ${
                              darkMode ? 'border-slate-700 hover:bg-slate-700/30' : 'border-gray-200 hover:bg-gray-50'
                            } ${!notification.read ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {notification.title}
                                </p>
                                <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                  {notification.message}
                                </p>
                                <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                                  {notification.timestamp.toLocaleTimeString('pt-BR')}
                                </p>
                              </div>
                              {!notification.read && (
                                <button
                                  onClick={() => markNotificationAsRead(notification.id)}
                                  className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"
                                />
                              )}
                            </div>
                            {notification.action && (
                              <button
                                onClick={notification.action.onClick}
                                className={`mt-2 text-sm px-3 py-1 rounded transition-colors ${
                                  darkMode 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                              >
                                {notification.action.label}
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {user && (
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-600">
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.login}
                    className="w-10 h-10 rounded-full border-2 border-slate-600 hover:border-blue-500 transition-all duration-200 cursor-pointer"
                    onClick={() => handleViewChange('profile')}
                  />
                  <div className="hidden md:block">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name || user.login}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      @{user.login}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Enhanced Sidebar */}
        <Sidebar
          menuItems={menuItems}
          currentView={currentView}
          onViewChange={handleViewChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          darkMode={darkMode}
          isOnline={isOnline}
          lastSync={lastSync}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <div className="p-6">
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <button
                      onClick={() => handleViewChange('dashboard')}
                      className={`${
                        darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                      } transition-colors`}
                    >
                      Início
                    </button>
                  </li>
                  <li>
                    <span className={`${darkMode ? 'text-slate-600' : 'text-gray-400'}`}>/</span>
                  </li>
                  <li>
                    <span className={`font-medium ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {menuItems.find(item => item.id === currentView)?.label}
                    </span>
                  </li>
                </ol>
              </nav>
            </div>

            {/* Content */}
            <div className="min-h-screen">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-medium">Carregando dados do GitHub...</p>
            <p className="text-slate-400 text-sm mt-2">Isso pode levar alguns segundos</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Sidebar Component
const Sidebar: React.FC<{
  menuItems: MenuItem[];
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  darkMode: boolean;
  isOnline: boolean;
  lastSync: Date;
}> = ({ 
  menuItems, 
  currentView, 
  onViewChange, 
  collapsed, 
  onToggleCollapse, 
  darkMode,
  isOnline,
  lastSync 
}) => {
  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] transition-all duration-300 z-40 border-r ${
      collapsed ? 'w-16' : 'w-64'
    } ${
      darkMode 
        ? 'bg-slate-800/95 border-slate-700' 
        : 'bg-white/95 border-gray-200'
    } backdrop-blur-sm`}>
      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : darkMode 
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                disabled={item.premium}
              >
                <Icon className={`w-5 h-5 ${
                  isActive 
                    ? 'text-white' 
                    : darkMode 
                      ? 'text-slate-400 group-hover:text-white' 
                      : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                {!collapsed && (
                  <>
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.premium && (
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        PRO
                      </span>
                    )}
                  </>
                )}
              </button>
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  {item.description && (
                    <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Status Section */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className={`rounded-lg p-3 border ${
            darkMode 
              ? 'bg-slate-700/50 border-slate-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-xs font-medium ${
                darkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                {isOnline ? 'GitHub Conectado' : 'Offline'}
              </span>
            </div>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Última sync: {lastSync.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className={`absolute -right-3 top-6 w-6 h-6 border rounded-full flex items-center justify-center transition-all duration-200 ${
          darkMode 
            ? 'bg-slate-700 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600' 
            : 'bg-white border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        {collapsed ? '→' : '←'}
      </button>
    </aside>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <GitHubProvider>
      <AppContent />
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
