import React, { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import LoadingOverlay from './LoadingOverlay';
import Breadcrumb from './Breadcrumb';
import type { ViewType, MenuItem, BreadcrumbItem, Notification } from '../types/app';

interface AppLayoutProps {
  // Layout state
  darkMode: boolean;
  isOnline: boolean;
  lastSync: Date;
  loading: boolean;
  
  // Sidebar props
  menuItems: MenuItem[];
  currentView: ViewType;
  sidebarCollapsed: boolean;
  onViewChange: (view: ViewType) => void;
  onToggleSidebar: () => void;
  
  // Header props
  notifications: Notification[];
  showNotifications: boolean;
  onToggleDarkMode: () => void;
  onToggleNotifications: () => void;
  onMarkNotificationAsRead: (id: string) => void;
  onClearAllNotifications: () => void;
  onRefresh: () => void;
  onUserProfileClick: () => void;
  
  // Breadcrumb
  breadcrumbItems: BreadcrumbItem[];
  
  // Content
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  // Layout state
  darkMode,
  isOnline,
  lastSync,
  loading,
  
  // Sidebar props
  menuItems,
  currentView,
  sidebarCollapsed,
  onViewChange,
  onToggleSidebar,
  
  // Header props
  notifications,
  showNotifications,
  onToggleDarkMode,
  onToggleNotifications,
  onMarkNotificationAsRead,
  onClearAllNotifications,
  onRefresh,
  onUserProfileClick,
  
  // Breadcrumb
  breadcrumbItems,
  
  // Content
  children,
}) => {
  return (
    <div className={`min-h-screen flex flex-col transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {/* Header - fixed at top */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        notifications={notifications}
        showNotifications={showNotifications}
        onToggleNotifications={onToggleNotifications}
        onMarkNotificationAsRead={onMarkNotificationAsRead}
        onClearAllNotifications={onClearAllNotifications}
        onRefresh={onRefresh}
        onUserProfileClick={onUserProfileClick}
        isOnline={isOnline}
      />

      <div className="flex flex-1">
        {/* Sidebar - integrated with header */}
        <Sidebar
          menuItems={menuItems}
          currentView={currentView}
          onViewChange={onViewChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={onToggleSidebar}
          darkMode={darkMode}
          isOnline={isOnline}
          lastSync={lastSync}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          {/* Content with padding */}
          <div className="flex-1 p-6 pt-20"> {/* pt-20 para compensar o header fixo */}
            {/* Breadcrumb */}
            <Breadcrumb 
              items={breadcrumbItems} 
              darkMode={darkMode} 
            />

            {/* Content */}
            <div className="min-h-[calc(100vh-200px)]">
              {children}
            </div>
          </div>

          {/* Footer */}
          <Footer darkMode={darkMode} />
        </main>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={loading}
        darkMode={darkMode}
      />
    </div>
  );
};

export default AppLayout;
