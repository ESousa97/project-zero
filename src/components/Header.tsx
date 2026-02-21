import React from 'react';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Github,
  RefreshCw,
} from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';
import type { Notification } from '../types/app';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  notifications: Notification[];
  showNotifications: boolean;
  onToggleNotifications: () => void;
  onMarkNotificationAsRead: (id: string) => void;
  onClearAllNotifications: () => void;
  onRefresh: () => void;
  onUserProfileClick: () => void;
  isOnline: boolean;
}

interface NotificationsDropdownProps {
  darkMode: boolean;
  notifications: Notification[];
  onMarkNotificationAsRead: (id: string) => void;
  onClearAllNotifications: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  darkMode,
  notifications,
  onMarkNotificationAsRead,
  onClearAllNotifications,
}) => {
  return (
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
              onClick={onClearAllNotifications}
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
                    onClick={() => onMarkNotificationAsRead(notification.id)}
                    className="w-4 h-4 bg-blue-500 rounded-full ml-2 flex-shrink-0"
                    aria-label="Marcar como lida"
                    title="Marcar como lida"
                  />
                )}
              </div>
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className="mt-2 text-sm px-3 py-1 rounded transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  notifications,
  showNotifications,
  onToggleNotifications,
  onMarkNotificationAsRead,
  onClearAllNotifications,
  onRefresh,
  onUserProfileClick,
  isOnline,
}) => {
  const { user, loading } = useGitHub();

  const unreadCount = notifications.filter(n => !n.read).length;
  const headerThemeClass = darkMode
    ? 'bg-slate-800/95 border-slate-700'
    : 'bg-white/95 border-gray-200';
  const iconButtonClass = darkMode
    ? 'text-slate-400 hover:text-white hover:bg-slate-700'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${headerThemeClass} backdrop-blur-sm`}>
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
              onClick={onRefresh}
              disabled={loading}
              className={`p-2 rounded-lg transition-all duration-200 ${iconButtonClass}`}
              title="Atualizar dados (Ctrl+R)"
              aria-label="Atualizar dados"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-200 ${iconButtonClass}`}
              title="Alternar tema"
              aria-label="Alternar tema"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={onToggleNotifications}
                className={`relative p-2 rounded-lg transition-all duration-200 ${iconButtonClass}`}
                title="Notificações"
                aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <NotificationsDropdown
                  darkMode={darkMode}
                  notifications={notifications}
                  onMarkNotificationAsRead={onMarkNotificationAsRead}
                  onClearAllNotifications={onClearAllNotifications}
                />
              )}
            </div>

            {/* User Avatar */}
            {user && (
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-600">
                <button
                  onClick={onUserProfileClick}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                  aria-label="Ver perfil"
                >
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.login}
                    className="w-10 h-10 rounded-full border-2 border-slate-600 hover:border-blue-500 transition-all duration-200 cursor-pointer"
                  />
                  <div className="hidden md:block text-left">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name || user.login}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      @{user.login}
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
