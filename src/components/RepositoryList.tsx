import React, { useState, useEffect } from 'react';
import { Search, GitBranch, Star, Eye, GitCommit, Lock, Unlock, ExternalLink, Calendar, RefreshCw } from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';

// Add proper types
type SortBy = 'updated' | 'created' | 'name' | 'stars';
type FilterBy = 'all' | 'public' | 'private';

const RepositoryList: React.FC = () => {
  const { repositories, loading, fetchRepositories } = useGitHub();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  useEffect(() => {
    if (repositories.length === 0) {
      fetchRepositories();
    }
  }, [repositories.length, fetchRepositories]);

  // Filtros e ordenação
  const filteredRepositories = React.useMemo(() => {
    const filtered = repositories.filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (repo.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesVisibility = filterBy === 'all' || 
                               (filterBy === 'public' && !repo.private) ||
                               (filterBy === 'private' && repo.private);
      
      const matchesLanguage = languageFilter === 'all' || repo.language === languageFilter;
      
      return matchesSearch && matchesVisibility && matchesLanguage;
    });

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        default:
          return 0;
      }
    });

    return filtered;
  }, [repositories, searchTerm, sortBy, filterBy, languageFilter]);

  // Linguagens únicas
  const languages = React.useMemo(() => {
    const langs = new Set(repositories.map(repo => repo.language).filter(Boolean));
    return Array.from(langs).sort();
  }, [repositories]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Repositórios</h1>
          <p className="text-slate-400">
            {filteredRepositories.length} de {repositories.length} repositórios
          </p>
        </div>
        <button
          onClick={fetchRepositories}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar repositórios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="updated">Última atualização</option>
            <option value="created">Data de criação</option>
            <option value="name">Nome</option>
            <option value="stars">Mais estrelas</option>
          </select>

          {/* Visibility Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">Todos</option>
            <option value="public">Públicos</option>
            <option value="private">Privados</option>
          </select>

          {/* Language Filter */}
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">Todas as linguagens</option>
            {languages.map(lang => (
              <option key={lang} value={lang || ''}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Repository List */}
      {loading && repositories.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Carregando repositórios...</p>
          </div>
        </div>
      ) : filteredRepositories.length > 0 ? (
        <div className="grid gap-6">
          {filteredRepositories.map((repo) => (
            <div key={repo.id} className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-300/50 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
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
                    <p className="text-slate-300 mb-4 leading-relaxed">{repo.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="font-medium">Criado:</span>
                        <span>{formatDateTime(repo.created_at)}</span>
                        <span className="text-blue-400 font-medium">({getTimeAgo(repo.created_at)})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="w-4 h-4 text-green-400" />
                        <span className="font-medium">Atualizado:</span>
                        <span>{formatDateTime(repo.updated_at)}</span>
                        <span className="text-green-400 font-medium">({getTimeAgo(repo.updated_at)})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {repo.language && (
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 ${getLanguageColor(repo.language)} rounded-full`}></div>
                          <span className="text-sm font-medium text-slate-300">{repo.language}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="font-medium">{repo.stargazers_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitCommit className="w-4 h-4 text-blue-400" />
                          <span className="font-medium">{repo.forks_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-purple-400" />
                          <span className="font-medium">{repo.watchers_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500 bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                    <strong>Nome completo:</strong> {repo.full_name}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <GitBranch className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Nenhum repositório encontrado</h3>
          <p className="text-slate-500">
            {searchTerm ? 'Tente ajustar os filtros de busca' : 'Nenhum repositório corresponde aos filtros selecionados'}
          </p>
        </div>
      )}
    </div>
  );
};

export default RepositoryList;
