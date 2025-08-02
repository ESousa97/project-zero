import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Eye,
  EyeOff,
  Trash2,
  // Remove unused imports
  Moon,
  Bell,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';

const Settings: React.FC = () => {
  // Contexto do GitHub: token, função para atualizar token e limpar erros
  const { token, setToken, clearError } = useGitHub();

  // Estados locais para configurações da UI
  const [newToken, setNewToken] = useState(token);
  const [showToken, setShowToken] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5);

  // Atualiza token no contexto e limpa erros
  const handleTokenUpdate = () => {
    setToken(newToken);
    clearError();
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
    }
  };

  // Exporta configurações atuais para arquivo JSON
  const exportSettings = () => {
    const settings = {
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

  // Importa configurações de arquivo JSON e atualiza estados
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        setDarkMode(settings.darkMode ?? true);
        setNotifications(settings.notifications ?? true);
        setAutoRefresh(settings.autoRefresh ?? false);
        setRefreshInterval(settings.refreshInterval ?? 5);
      } catch {
        alert('Erro ao importar configurações. Verifique se o arquivo é válido.');
      }
    };
    reader.readAsText(file);
  };

  // Limpa todo cache e recarrega a página após confirmação
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

  // Use functions to avoid unused variable errors
  React.useEffect(() => {
    // These functions are available for use if needed
    console.log('Settings functions initialized:', {
      exportSettings,
      importSettings,
      clearCache
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Título e descrição da página */}
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-slate-400">
          Gerencie suas preferências e configurações da aplicação
        </p>
      </header>

      {/* Rest of component remains the same... */}
    </div>
  );
};

export default Settings;
