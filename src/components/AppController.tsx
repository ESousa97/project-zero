import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  GitBranch,
  Settings,
  User,
  Activity,
  GitCommit,
} from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';
import { useNotificationManager } from './NotificationManager';
import type { ViewType, MenuItem, BreadcrumbItem } from '../types/app';

export type { ViewType, MenuItem, BreadcrumbItem } from '../types/app';

export interface AppState {
  currentView: ViewType;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  isOnline: boolean;
  lastSync: Date;
  menuItems: MenuItem[];
  breadcrumbItems: BreadcrumbItem[];
  notificationManager: ReturnType<typeof useNotificationManager>;
  setCurrentView: (view: ViewType) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  handleRefresh: () => void;
  handleUserProfileClick: () => void;
}

export const useAppController = (): AppState => {
  const [currentView, setCurrentViewState] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Inicialização do dark mode apenas uma vez
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Refs para controle de estado
  const refreshTimeoutRef = useRef<number | null>(null);
  const isRefreshingRef = useRef(false);

  const { repositories, error, token, refreshAll, clearAllErrors } = useGitHub();
  const notificationManager = useNotificationManager();

  const setCurrentView = useCallback(
    (view: ViewType) => {
      setCurrentViewState(view);
      clearAllErrors();
    },
    [clearAllErrors]
  );

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Activity,
        description: 'Visão geral completa e métricas avançadas',
      },
      {
        id: 'repositories',
        label: 'Repositórios',
        icon: GitBranch,
        description: 'Gestão avançada de repositórios com analytics',
        badge: repositories.length > 0 ? repositories.length.toString() : undefined,
      },
      {
        id: 'commits',
        label: 'Commits',
        icon: GitCommit,
        description: 'Histórico detalhado de commits e análises',
      },
      {
        id: 'profile',
        label: 'Perfil',
        icon: User,
        description: 'Perfil avançado do desenvolvedor com insights',
      },
      {
        id: 'settings',
        label: 'Configurações',
        icon: Settings,
        description: 'Configurações avançadas e preferências',
      },
    ],
    [repositories.length]
  );

  const breadcrumbItems: BreadcrumbItem[] = useMemo(
    () => [
      {
        label: 'Início',
        onClick: () => setCurrentView('dashboard'),
        isActive: false,
      },
      {
        label: menuItems.find((item) => item.id === currentView)?.label || 'Página',
        isActive: true,
      },
    ],
    [currentView, menuItems, setCurrentView]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev: boolean) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;

    try {
      isRefreshingRef.current = true;
      await refreshAll();
      setLastSync(new Date());
      notificationManager.addNotification({
        type: 'success',
        title: 'Dados Atualizados',
        message: 'Seus dados do GitHub foram sincronizados com sucesso',
      });
    } catch {
      notificationManager.addNotification({
        type: 'error',
        title: 'Erro na Sincronização',
        message: 'Não foi possível atualizar os dados. Tente novamente.',
      });
    } finally {
      isRefreshingRef.current = false;
    }
  }, [refreshAll, notificationManager]);

  const handleUserProfileClick = useCallback(() => {
    setCurrentView('profile');
  }, [setCurrentView]);

  // Auto-refresh effect
  useEffect(() => {
    if (!token) return;

    // Limpar timeout anterior
    if (refreshTimeoutRef.current !== null) {
      window.clearTimeout(refreshTimeoutRef.current);
    }

    // Configurar novo auto-refresh
    refreshTimeoutRef.current = window.setTimeout(() => {
      if (isOnline && document.visibilityState === 'visible' && !isRefreshingRef.current) {
        handleRefresh();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      if (refreshTimeoutRef.current !== null) {
        window.clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [token, handleRefresh, isOnline]);

  // Online/Offline handlers
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      notificationManager.addNotification({
        type: 'success',
        title: 'Conexão Restaurada',
        message: 'Você está online novamente!',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      notificationManager.addNotification({
        type: 'warning',
        title: 'Conexão Perdida',
        message: 'Você está offline. Algumas funcionalidades podem estar limitadas.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [notificationManager]);

  // Error handling
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
          },
        },
      });
    }
  }, [error, clearAllErrors, handleRefresh, notificationManager]);

  // Keyboard shortcuts
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
    currentView,
    sidebarCollapsed,
    darkMode,
    isOnline,
    lastSync,
    menuItems,
    breadcrumbItems,
    notificationManager,
    setCurrentView,
    toggleSidebar,
    toggleDarkMode,
    handleRefresh,
    handleUserProfileClick,
  };
};
