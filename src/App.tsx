import React from 'react';
import { GitHubProvider } from './context/GitHubContext';
import AppLayout from './components/AppLayout';
import ViewRenderer from './components/ViewRenderer';
import { useAppController } from './components/AppController';

/**
 * Componente principal da aplicação
 */
const AppContent: React.FC = () => {
  const appState = useAppController();

  return (
    <AppLayout
      darkMode={appState.darkMode}
      isOnline={appState.isOnline}
      lastSync={appState.lastSync}
      loading={false}
      
      menuItems={appState.menuItems}
      currentView={appState.currentView}
      sidebarCollapsed={appState.sidebarCollapsed}
      onViewChange={appState.setCurrentView}
      onToggleSidebar={appState.toggleSidebar}
      
      notifications={appState.notificationManager.notifications}
      showNotifications={appState.notificationManager.showNotifications}
      onToggleDarkMode={appState.toggleDarkMode}
      onToggleNotifications={appState.notificationManager.toggleShow}
      onMarkNotificationAsRead={appState.notificationManager.markAsRead}
      onClearAllNotifications={appState.notificationManager.clearAll}
      onRefresh={appState.handleRefresh}
      onUserProfileClick={appState.handleUserProfileClick}
      
      breadcrumbItems={appState.breadcrumbItems}
    >
      <ViewRenderer
        currentView={appState.currentView}
        onViewChange={appState.setCurrentView}
        darkMode={appState.darkMode}
      />
    </AppLayout>
  );
};

/**
 * App principal com provider
 */
const App: React.FC = () => {
  return (
    <GitHubProvider>
      <AppContent />
    </GitHubProvider>
  );
};

export default App;
