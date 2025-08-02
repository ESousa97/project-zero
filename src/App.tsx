import React from 'react';
import { createRoot } from 'react-dom/client';

// Context Provider
import { GitHubProvider } from './context/GitHubContext';

// Componentes modularizados
import AppLayout from './components/AppLayout';
import ViewRenderer from './components/ViewRenderer';

// Hooks de controle
import { useAppController } from './components/AppController';

// Styles
import './style.css';

/**
 * Componente principal da aplicação modularizada
 */
const AppContent: React.FC = () => {
  // Usa o hook controlador que gerencia todo o estado da aplicação
  const appState = useAppController();

  return (
    <AppLayout
      // Layout state
      darkMode={appState.darkMode}
      isOnline={appState.isOnline}
      lastSync={appState.lastSync}
      loading={false} // O loading será gerenciado pelos componentes específicos
      
      // Sidebar props
      menuItems={appState.menuItems}
      currentView={appState.currentView}
      sidebarCollapsed={appState.sidebarCollapsed}
      onViewChange={appState.setCurrentView}
      onToggleSidebar={appState.toggleSidebar}
      
      // Header props
      notifications={appState.notificationManager.notifications}
      showNotifications={appState.notificationManager.showNotifications}
      onToggleDarkMode={appState.toggleDarkMode}
      onToggleNotifications={appState.notificationManager.toggleShow}
      onMarkNotificationAsRead={appState.notificationManager.markAsRead}
      onClearAllNotifications={appState.notificationManager.clearAll}
      onRefresh={appState.handleRefresh}
      onUserProfileClick={appState.handleUserProfileClick}
      
      // Breadcrumb
      breadcrumbItems={appState.breadcrumbItems}
    >
      {/* Renderizador de views */}
      <ViewRenderer
        currentView={appState.currentView}
        onViewChange={appState.setCurrentView}
        darkMode={appState.darkMode}
      />
    </AppLayout>
  );
};

/**
 * Componente App principal com provider
 */
const App: React.FC = () => {
  return (
    <GitHubProvider>
      <AppContent />
    </GitHubProvider>
  );
};

/**
 * Inicialização da aplicação React
 */
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container not found');
}

export default App;