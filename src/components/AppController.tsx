import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  GitBranch, Settings, User, Activity, GitCommit 
} from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';
import { useNotificationManager } from './NotificationManager';
import type { ViewType, MenuItem, BreadcrumbItem } from '../types/app';

// Re-export dos tipos para compatibilidade
export type { ViewType, MenuItem, BreadcrumbItem } from '../types/app';

export interface AppState {
  // UI State
  currentView: ViewType;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  isOnline: boolean;
  lastSync: Date;
  
  // Menu items
  menuItems: MenuItem[];
  breadcrumbItems: BreadcrumbItem[];
  
  // Notification system
  notificationManager: ReturnType<typeof useNotificationManager>;
  
  // Actions
  setCurrentView: (view: ViewType) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  handleRefresh: () => void;
  handleUserProfileClick: () => void;
}

export const useAppController = (): AppState => {
  const [currentView, setCurrentViewState] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const { 
    repositories, 
    error, 
    token,
    refreshAll,
    clearAllErrors 
  } = useGitHub();

  const notificationManager = useNotificationManager();

  // Otimizar callbacks com useCallback - mover para antes do useMemo
  const setCurrentView = useCallback((view: ViewType) => {
    setCurrentViewState(view);
    clearAllErrors();
  }, [clearAllErrors]);

  // Memoizar menu items para evitar recriações
  const menuItems: MenuItem[] = useMemo(() => [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Activity, 
      description: 'Visão geral completa e métricas avançadas'
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
      id: 'settings', 
      label: 'Configurações', 
      icon: Settings, 
      description: 'Configurações avançadas e preferências'
    }
  ], [repositories.length]);

  // Memoizar breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    {
      label: 'Início',
      onClick: () => setCurrentView('dashboard'),
      isActive: false
    },
    {
      label: menuItems.find(item => item.id === currentView)?.label || 'Página',
      isActive: true
    }
  ], [currentView, menuItems, setCurrentView]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshAll();
      setLastSync(new Date());
      notificationManager.addNotification({
        type: 'success',
        title: 'Dados Atualizados',
        message: 'Seus dados do GitHub foram sincronizados com sucesso'
      });
    } catch {
      notificationManager.addNotification({
        type: 'error',
        title: 'Erro na Sincronização',
        message: 'Não foi possível atualizar os dados. Tente novamente.'
      });
    }
  }, [refreshAll, notificationManager]);

  const handleUserProfileClick = useCallback(() => {
    setCurrentView('profile');
  }, [setCurrentView]);

  // Carregar preferências apenas uma vez
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      try {
        setDarkMode(JSON.parse(savedDarkMode));
      } catch (error) {
        console.error('Erro ao carregar tema salvo:', error);
      }
    }
  }, []);

  // Auto-refresh otimizado
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (isOnline && document.visibilityState === 'visible') {
        handleRefresh();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, handleRefresh, isOnline]);

  // Online/offline detection otimizada - incluir notificationManager
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      notificationManager.addNotification({
        type: 'success',
        title: 'Conexão Restaurada',
        message: 'Você está online novamente!'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      notificationManager.addNotification({
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
  }, [notificationManager]);

  // Error handling otimizado - incluir todas as dependências
  useEffect(() => {
    if (error) {
      notificationManager.addNotification({
        type: 'error',
        title: 'Erro Detectado',
        message: error,
        action: {
          label: 'Tentar Novamente',
          onClick: () => {
            clearAllErrors();
            handleRefresh();
          }
        }
      });
    }
  }, [error, clearAllErrors, handleRefresh, notificationManager]);

  // Keyboard shortcuts otimizados - incluir notificationManager
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            setCurrentView('dashboard');
            break;
          case '2':
            event.preventDefault();
            setCurrentView('repositories');
            break;
          case '3':
            event.preventDefault();
            setCurrentView('commits');
            break;
          case '4':
            event.preventDefault();
            setCurrentView('profile');
            break;
          case 'r':
            event.preventDefault();
            handleRefresh();
            break;
          case ',':
            event.preventDefault();
            setCurrentView('settings');
            break;
          case 'b':
            event.preventDefault();
            toggleSidebar();
            break;
        }
      }
      
      if (event.key === 'Escape' && notificationManager.showNotifications) {
        notificationManager.toggleShow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRefresh, toggleSidebar, notificationManager, setCurrentView]);

  return {
    // UI State
    currentView,
    sidebarCollapsed,
    darkMode,
    isOnline,
    lastSync,
    
    // Menu items
    menuItems,
    breadcrumbItems,
    
    // Notification system
    notificationManager,
    
    // Actions
    setCurrentView,
    toggleSidebar,
    toggleDarkMode,
    handleRefresh,
    handleUserProfileClick,
  };
};
