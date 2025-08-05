import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Moon,
  Sun,
  Bell,
  BellOff,
  Shield,
  RefreshCw,
  Download,
  Upload,
  Save,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';

// Interface para o objeto de configurações salvas
interface SettingsData {
  darkMode: boolean;
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  exportedAt?: string;
}

const Settings: React.FC = () => {
  // Contexto GitHub para manipular token e erros
  const { token, setToken, clearError } = useGitHub();

  // Estados locais para configurações e UI
  const [newToken, setNewToken] = useState(token);
  const [showToken, setShowToken] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Carregar configurações salvas do localStorage no carregamento do componente
  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      try {
        const settings: SettingsData = JSON.parse(savedSettings);
        setDarkMode(settings.darkMode ?? true);
        setNotifications(settings.notifications ?? true);
        setAutoRefresh(settings.autoRefresh ?? false);
        setRefreshInterval(settings.refreshInterval ?? 5);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  // Salvar configurações no localStorage com debounce de 1 segundo para evitar gravações excessivas
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const settings: SettingsData = {
        darkMode,
        notifications,
        autoRefresh,
        refreshInterval,
      };
      localStorage.setItem('app_settings', JSON.stringify(settings));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [darkMode, notifications, autoRefresh, refreshInterval]);

  // Atualiza o token no contexto e limpa erros
  const handleTokenUpdate = () => {
    if (!newToken.trim()) {
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saving');
    setToken(newToken);
    clearError();

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  // Revoga token após confirmação do usuário
  const handleTokenRevoke = () => {
    if (
      confirm(
        'Tem certeza que deseja revogar o token? Você precisará configurar um novo token para continuar usando a aplicação.'
      )
    ) {
      setToken('');
      setNewToken('');
      localStorage.removeItem('github_token');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Exporta as configurações atuais para um arquivo JSON
  const exportSettings = () => {
    const settings: SettingsData = {
      darkMode,
      notifications,
      autoRefresh,
      refreshInterval,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gitvision-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Importa configurações de arquivo JSON e atualiza os estados correspondentes
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings: SettingsData = JSON.parse(e.target?.result as string);
        setDarkMode(settings.darkMode ?? true);
        setNotifications(settings.notifications ?? true);
        setAutoRefresh(settings.autoRefresh ?? false);
        setRefreshInterval(settings.refreshInterval ?? 5);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        alert('Erro ao importar configurações. Verifique se o arquivo é válido.');
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    };
    reader.readAsText(file);

    // Resetar o input para permitir reimportar o mesmo arquivo se necessário
    event.target.value = '';
  };

  // Limpa o cache local após confirmação do usuário e recarrega a página
  const clearCache = () => {
    if (
      confirm(
        'Tem certeza que deseja limpar o cache? Isso removerá todos os dados armazenados localmente.'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Retorna o ícone correspondente ao status do salvamento
  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'saved':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Save className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Título e descrição */}
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-slate-400">
          Gerencie suas preferências e configurações da aplicação
        </p>
      </header>

      {/* Seção Token do GitHub */}
      <section className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Token do GitHub</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="github-token" className="block text-sm font-medium text-slate-300 mb-2">
              Personal Access Token
            </label>
            <div className="relative">
              <input
                id="github-token"
                type={showToken ? 'text' : 'password'}
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
                aria-label={showToken ? 'Ocultar token' : 'Mostrar token'}
              >
                {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleTokenUpdate}
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
            >
              {getSaveStatusIcon()}
              {saveStatus === 'saving' ? 'Salvando...' : 'Salvar Token'}
            </button>

            {token && (
              <button
                onClick={handleTokenRevoke}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Revogar Token
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Preferências da Interface */}
      <section className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Preferências da Interface</h2>
        </div>

        <div className="space-y-6">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-slate-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              <div>
                <h3 className="font-medium text-white">Modo Escuro</h3>
                <p className="text-sm text-slate-400">Alterna entre tema claro e escuro</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                darkMode ? 'bg-blue-600' : 'bg-slate-600'
              }`}
              aria-pressed={darkMode}
              aria-label="Alternar modo escuro"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {notifications ? <Bell className="w-5 h-5 text-blue-400" /> : <BellOff className="w-5 h-5 text-slate-400" />}
              <div>
                <h3 className="font-medium text-white">Notificações</h3>
                <p className="text-sm text-slate-400">Receber notificações sobre atualizações</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                notifications ? 'bg-blue-600' : 'bg-slate-600'
              }`}
              aria-pressed={notifications}
              aria-label="Alternar notificações"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'text-green-400' : 'text-slate-400'}`} />
              <div>
                <h3 className="font-medium text-white">Atualização Automática</h3>
                <p className="text-sm text-slate-400">Atualizar dados automaticamente</p>
              </div>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                autoRefresh ? 'bg-blue-600' : 'bg-slate-600'
              }`}
              aria-pressed={autoRefresh}
              aria-label="Alternar atualização automática"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Intervalo de Atualização */}
          {autoRefresh && (
            <div className="ml-8">
              <label
                htmlFor="refresh-interval"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Intervalo de Atualização (minutos)
              </label>
              <select
                id="refresh-interval"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                aria-label="Selecionar intervalo de atualização"
              >
                <option value={1}>1 minuto</option>
                <option value={5}>5 minutos</option>
                <option value={10}>10 minutos</option>
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Gerenciamento de Dados */}
      <section className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-semibold text-white">Gerenciamento de Dados</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Botão Exportar Configurações */}
          <button
            onClick={exportSettings}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            Exportar Configurações
          </button>

          {/* Botão Importar Configurações */}
          <label
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Importar Configurações
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
              aria-label="Importar configurações a partir de arquivo JSON"
            />
          </label>

          {/* Botão Limpar Cache */}
          <button
            onClick={clearCache}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Limpar Cache
          </button>
        </div>

        {/* Informação de privacidade */}
        <div className="mt-4 p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
          <h4 className="font-semibold text-slate-300 mb-2">Privacidade e Segurança</h4>
          <p className="text-sm text-slate-400">
            Todas as configurações são armazenadas localmente no seu navegador.
            Seus dados nunca são enviados para servidores externos.
          </p>
        </div>
      </section>

      {/* Status da operação de salvar */}
      {saveStatus !== 'idle' && (
        <div
          className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border ${
            saveStatus === 'saved'
              ? 'border-green-500/30'
              : saveStatus === 'error'
              ? 'border-red-500/30'
              : 'border-blue-500/30'
          }`}
        >
          <div
            className={`flex items-center gap-2 ${
              saveStatus === 'saved'
                ? 'text-green-400'
                : saveStatus === 'error'
                ? 'text-red-400'
                : 'text-blue-400'
            }`}
          >
            {getSaveStatusIcon()}
            <span className="font-medium">
              {saveStatus === 'saving' && 'Salvando configurações...'}
              {saveStatus === 'saved' && 'Configurações salvas com sucesso!'}
              {saveStatus === 'error' && 'Erro ao salvar configurações.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
