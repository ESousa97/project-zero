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

const defaultSettings: SettingsData = {
  darkMode: true,
  notifications: true,
  autoRefresh: false,
  refreshInterval: 5,
};

const loadInitialSettings = (): SettingsData => {
  const savedSettings = localStorage.getItem('app_settings');
  if (!savedSettings) {
    return defaultSettings;
  }

  try {
    const parsedSettings = JSON.parse(savedSettings) as Partial<SettingsData>;
    return {
      darkMode: parsedSettings.darkMode ?? defaultSettings.darkMode,
      notifications: parsedSettings.notifications ?? defaultSettings.notifications,
      autoRefresh: parsedSettings.autoRefresh ?? defaultSettings.autoRefresh,
      refreshInterval: parsedSettings.refreshInterval ?? defaultSettings.refreshInterval,
    };
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return defaultSettings;
  }
};

interface SettingsStatusBannerProps {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  getSaveStatusIcon: () => React.ReactNode;
}

interface ToggleSettingRowProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  ariaLabel: string;
}

interface TokenSettingsSectionProps {
  token: string;
  newToken: string;
  showToken: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onTokenChange: (value: string) => void;
  onToggleTokenVisibility: () => void;
  onSaveToken: () => void;
  onRevokeToken: () => void;
  getSaveStatusIcon: () => React.ReactNode;
}

interface InterfaceSettingsSectionProps {
  darkMode: boolean;
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  onToggleDarkMode: () => void;
  onToggleNotifications: () => void;
  onToggleAutoRefresh: () => void;
  onChangeRefreshInterval: (value: number) => void;
}

interface DataManagementSectionProps {
  onExportSettings: () => void;
  onImportSettings: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearCache: () => void;
}

const SettingsStatusBanner: React.FC<SettingsStatusBannerProps> = ({ saveStatus, getSaveStatusIcon }) => {
  if (saveStatus === 'idle') {
    return null;
  }

  return (
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
  );
};

const ToggleSettingRow: React.FC<ToggleSettingRowProps> = ({
  title,
  description,
  enabled,
  onToggle,
  icon,
  ariaLabel,
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <h3 className="font-medium text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        enabled ? 'bg-blue-600' : 'bg-slate-600'
      }`}
      aria-pressed={enabled}
      aria-label={ariaLabel}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const TokenSettingsSection: React.FC<TokenSettingsSectionProps> = ({
  token,
  newToken,
  showToken,
  saveStatus,
  onTokenChange,
  onToggleTokenVisibility,
  onSaveToken,
  onRevokeToken,
  getSaveStatusIcon,
}) => (
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
            onChange={(e) => onTokenChange(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <button
            type="button"
            onClick={onToggleTokenVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
            aria-label={showToken ? 'Ocultar token' : 'Mostrar token'}
          >
            {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSaveToken}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
        >
          {getSaveStatusIcon()}
          {saveStatus === 'saving' ? 'Salvando...' : 'Salvar Token'}
        </button>

        {token && (
          <button
            onClick={onRevokeToken}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Revogar Token
          </button>
        )}
      </div>
    </div>
  </section>
);

const InterfaceSettingsSection: React.FC<InterfaceSettingsSectionProps> = ({
  darkMode,
  notifications,
  autoRefresh,
  refreshInterval,
  onToggleDarkMode,
  onToggleNotifications,
  onToggleAutoRefresh,
  onChangeRefreshInterval,
}) => (
  <section className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
    <div className="flex items-center gap-3 mb-6">
      <SettingsIcon className="w-6 h-6 text-purple-400" />
      <h2 className="text-xl font-semibold text-white">Preferências da Interface</h2>
    </div>

    <div className="space-y-6">
      <ToggleSettingRow
        title="Modo Escuro"
        description="Alterna entre tema claro e escuro"
        enabled={darkMode}
        onToggle={onToggleDarkMode}
        icon={darkMode ? <Moon className="w-5 h-5 text-slate-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
        ariaLabel="Alternar modo escuro"
      />

      <ToggleSettingRow
        title="Notificações"
        description="Receber notificações sobre atualizações"
        enabled={notifications}
        onToggle={onToggleNotifications}
        icon={notifications ? <Bell className="w-5 h-5 text-blue-400" /> : <BellOff className="w-5 h-5 text-slate-400" />}
        ariaLabel="Alternar notificações"
      />

      <ToggleSettingRow
        title="Atualização Automática"
        description="Atualizar dados automaticamente"
        enabled={autoRefresh}
        onToggle={onToggleAutoRefresh}
        icon={<RefreshCw className={`w-5 h-5 ${autoRefresh ? 'text-green-400' : 'text-slate-400'}`} />}
        ariaLabel="Alternar atualização automática"
      />

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
            onChange={(e) => onChangeRefreshInterval(Number(e.target.value))}
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
);

const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  onExportSettings,
  onImportSettings,
  onClearCache,
}) => (
  <section className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
    <div className="flex items-center gap-3 mb-6">
      <Shield className="w-6 h-6 text-green-400" />
      <h2 className="text-xl font-semibold text-white">Gerenciamento de Dados</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        onClick={onExportSettings}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200"
      >
        <Download className="w-4 h-4" />
        Exportar Configurações
      </button>

      <label
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer"
      >
        <Upload className="w-4 h-4" />
        Importar Configurações
        <input
          type="file"
          accept=".json"
          onChange={onImportSettings}
          className="hidden"
          aria-label="Importar configurações a partir de arquivo JSON"
        />
      </label>

      <button
        onClick={onClearCache}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200"
      >
        <Trash2 className="w-4 h-4" />
        Limpar Cache
      </button>
    </div>

    <div className="mt-4 p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
      <h4 className="font-semibold text-slate-300 mb-2">Privacidade e Segurança</h4>
      <p className="text-sm text-slate-400">
        Todas as configurações são armazenadas localmente no seu navegador.
        Seus dados nunca são enviados para servidores externos.
      </p>
    </div>
  </section>
);

const Settings: React.FC = () => {
  // Contexto GitHub para manipular token e erros
  const { token, setToken, clearError } = useGitHub();

  // Estados locais para configurações e UI
  const [newToken, setNewToken] = useState(token);
  const [showToken, setShowToken] = useState(false);
  const [initialSettings] = useState<SettingsData>(() => loadInitialSettings());
  const [darkMode, setDarkMode] = useState(initialSettings.darkMode);
  const [notifications, setNotifications] = useState(initialSettings.notifications);
  const [autoRefresh, setAutoRefresh] = useState(initialSettings.autoRefresh);
  const [refreshInterval, setRefreshInterval] = useState(initialSettings.refreshInterval);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-slate-400">
          Gerencie suas preferências e configurações da aplicação
        </p>
      </header>

      <TokenSettingsSection
        token={token}
        newToken={newToken}
        showToken={showToken}
        saveStatus={saveStatus}
        onTokenChange={setNewToken}
        onToggleTokenVisibility={() => setShowToken(!showToken)}
        onSaveToken={handleTokenUpdate}
        onRevokeToken={handleTokenRevoke}
        getSaveStatusIcon={getSaveStatusIcon}
      />

      <InterfaceSettingsSection
        darkMode={darkMode}
        notifications={notifications}
        autoRefresh={autoRefresh}
        refreshInterval={refreshInterval}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onToggleNotifications={() => setNotifications(!notifications)}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        onChangeRefreshInterval={setRefreshInterval}
      />

      <DataManagementSection
        onExportSettings={exportSettings}
        onImportSettings={importSettings}
        onClearCache={clearCache}
      />

      <SettingsStatusBanner saveStatus={saveStatus} getSaveStatusIcon={getSaveStatusIcon} />
    </div>
  );
};

export default Settings;
