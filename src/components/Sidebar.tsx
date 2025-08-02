import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ViewType, MenuItem } from '../types/app';

interface SidebarProps {
  menuItems: MenuItem[];
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  darkMode: boolean;
  isOnline: boolean;
  lastSync: Date;
}

const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  currentView,
  onViewChange,
  collapsed,
  onToggleCollapse,
  darkMode,
  isOnline,
  lastSync,
}) => {
  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] transition-all duration-300 z-40 border-r ${
      collapsed ? 'w-16' : 'w-64'
    } ${
      darkMode 
        ? 'bg-slate-800/95 border-slate-700' 
        : 'bg-white/95 border-gray-200'
    } backdrop-blur-sm`}>
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className={`absolute -right-3 top-6 w-6 h-6 border rounded-full flex items-center justify-center transition-all duration-200 ${
          darkMode 
            ? 'bg-slate-700 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600' 
            : 'bg-white border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
        aria-label={collapsed ? 'Expandir sidebar' : 'Contrair sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Navigation */}
      <nav className="p-4 space-y-2" role="navigation" aria-label="Menu principal">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onViewChange(item.id)}
                disabled={item.premium}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : darkMode 
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                } ${item.premium ? 'opacity-60 cursor-not-allowed' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
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
                  {item.premium && (
                    <div className="text-xs text-yellow-300 mt-1">Funcionalidade Premium</div>
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
    </aside>
  );
};

export default Sidebar;
