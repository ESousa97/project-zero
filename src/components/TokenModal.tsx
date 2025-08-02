import React, { useState } from 'react';
import { X, Github, Eye, EyeOff, ExternalLink, Shield } from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TokenModal: React.FC<TokenModalProps> = ({ isOpen, onClose }) => {
  const { setToken } = useGitHub();
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenInput.trim()) {
      setError('Por favor, insira seu token do GitHub');
      return;
    }

    if (!tokenInput.startsWith('ghp_') && !tokenInput.startsWith('github_pat_')) {
      setError('Token inválido. Certifique-se de que é um Personal Access Token válido');
      return;
    }

    setToken(tokenInput.trim());
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Github className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Configurar GitHub Token</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informação */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-400 mb-1">Por que preciso de um token?</h3>
                <p className="text-sm text-slate-300">
                  Para acessar seus repositórios e dados do GitHub de forma segura, você precisa fornecer um Personal Access Token.
                  Seus dados são processados localmente e o token é armazenado apenas no seu navegador.
                </p>
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Como criar um Personal Access Token:</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>Acesse as configurações do GitHub</li>
              <li>Vá para "Developer settings" → "Personal access tokens" → "Tokens (classic)"</li>
              <li>Clique em "Generate new token (classic)"</li>
              <li>Selecione as seguintes permissões:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-sm">
                  <li><code className="bg-slate-700 px-1 rounded">repo</code> - Acesso total aos repositórios</li>
                  <li><code className="bg-slate-700 px-1 rounded">user</code> - Informações do perfil</li>
                  <li><code className="bg-slate-700 px-1 rounded">read:org</code> - Informações da organização</li>
                </ul>
              </li>
              <li>Copie o token gerado</li>
            </ol>
            
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <span>Criar Token no GitHub</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-slate-300 mb-2">
                GitHub Personal Access Token
              </label>
              <div className="relative">
                <input
                  id="token"
                  type={showToken ? 'text' : 'password'}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 pr-12 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Conectar ao GitHub
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg font-semibold transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>

          {/* Security Note */}
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
            <h4 className="font-semibold text-slate-300 mb-2">🔒 Segurança</h4>
            <p className="text-sm text-slate-400">
              Seu token é armazenado localmente no navegador e nunca é enviado para nossos servidores.
              Você pode revogar o acesso a qualquer momento nas configurações do GitHub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenModal;
