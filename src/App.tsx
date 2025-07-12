import React, { useState } from 'react';
import { Search, Calendar, ExternalLink, Lock, Unlock, AlertCircle } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

const GitHubReposViewer: React.FC = () => {
  const [githubToken, setGithubToken] = useState<string>('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchRepositories = async () => {
    if (!githubToken.trim()) {
      setError('Por favor, insira sua chave de acesso do GitHub');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.github.com/user/repos?per_page=100', {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }

      const data: Repository[] = await response.json();
      
      // Ordenar por data de criação (mais recente primeiro)
      const sortedRepos = data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRepositories(sortedRepos);
    } catch (err) {
      setError(`Erro ao buscar repositórios: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h atrás`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} meses atrás`;
    return `${Math.floor(diffInSeconds / 31536000)} anos atrás`;
  };

  const getLanguageColor = (language: string | null) => {
    const colors: { [key: string]: string } = {
      'JavaScript': 'bg-yellow-400',
      'TypeScript': 'bg-blue-600',
      'Python': 'bg-green-500',
      'Java': 'bg-orange-500',
      'C++': 'bg-pink-500',
      'C#': 'bg-purple-500',
      'PHP': 'bg-indigo-500',
      'Ruby': 'bg-red-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-600',
      'Swift': 'bg-orange-400',
      'Kotlin': 'bg-purple-600',
      'Dart': 'bg-blue-400',
      'HTML': 'bg-orange-400',
      'CSS': 'bg-blue-500',
      'Vue': 'bg-green-600',
      'React': 'bg-blue-400'
    };
    return colors[language || ''] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 mb-8 border border-gray-200">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Search className="w-8 h-8 text-white" />
            </div>
            Meus Repositórios GitHub
          </h1>
          
          <div className="mb-8">
            <label htmlFor="token" className="block text-sm font-semibold text-gray-700 mb-3">
              GitHub Personal Access Token
            </label>
            <div className="flex gap-3">
              <input
                id="token"
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
              <button
                onClick={fetchRepositories}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Carregando...
                  </div>
                ) : 'Buscar Repositórios'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {repositories.length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                Repositórios Encontrados
              </h2>
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold">
                <Calendar className="w-5 h-5" />
                {repositories.length} repositórios
              </div>
            </div>
            
            <div className="grid gap-6">
              {repositories.map((repo) => (
                <div key={repo.id} className="group bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors">
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
                            {repo.name}
                            <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </a>
                        </h3>
                        <div className="flex items-center gap-2">
                          {repo.private ? (
                            <div className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                              <Lock className="w-4 h-4" />
                              Privado
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                              <Unlock className="w-4 h-4" />
                              Público
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {repo.description && (
                        <p className="text-gray-600 mb-4 leading-relaxed">{repo.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Criado:</span>
                            <span>{formatDateTime(repo.created_at)}</span>
                            <span className="text-blue-600 font-medium">({getTimeAgo(repo.created_at)})</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-green-500" />
                            <span className="font-medium">Atualizado:</span>
                            <span>{formatDateTime(repo.updated_at)}</span>
                            <span className="text-green-600 font-medium">({getTimeAgo(repo.updated_at)})</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {repo.language && (
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 ${getLanguageColor(repo.language)} rounded-full`}></div>
                              <span className="text-sm font-medium text-gray-700">{repo.language}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span className="font-medium">{repo.stargazers_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-blue-500">🍴</span>
                              <span className="font-medium">{repo.forks_count}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 bg-gray-100 rounded-lg p-3">
                        <strong>Nome completo:</strong> {repo.full_name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubReposViewer;
