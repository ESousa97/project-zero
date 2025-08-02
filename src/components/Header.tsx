import React from 'react';
import { Github, Bell, Search, Moon, Sun } from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';

const Header: React.FC = () => {
  const { user } = useGitHub();
  const [darkMode, setDarkMode] = React.useState(true);

  return (
    <header className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Github className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">GitVision</h1>
                <p className="text-sm text-slate-400">Sua plataforma Git completa</p>
              </div>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar repositórios, commits, usuários..."
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Menu Direito */}
          <div className="flex items-center space-x-4">
            {/* Toggle Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notificações */}
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Avatar do Usuário */}
            {user && (
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-600">
                <img
                  src={user.avatar_url}
                  alt={user.name || user.login}
                  className="w-10 h-10 rounded-full border-2 border-slate-600 hover:border-blue-500 transition-all duration-200"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-white">{user.name || user.login}</p>
                  <p className="text-xs text-slate-400">@{user.login}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
