import React, { useEffect } from 'react';
import { MapPin, Link as LinkIcon, Building, Mail, Calendar, GitBranch, Star, Users, BookOpen, ExternalLink } from 'lucide-react';
import { useGitHub } from '../context/GitHubContext';

const UserProfile: React.FC = () => {
  const { user, repositories, loading, fetchUser } = useGitHub();

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-400 mb-2">Perfil não encontrado</h3>
        <p className="text-slate-500">Não foi possível carregar as informações do perfil</p>
      </div>
    );
  }

  const stats = {
    totalRepos: repositories.length,
    totalStars: repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    totalForks: repositories.reduce((sum, repo) => sum + repo.forks_count, 0),
    languages: [...new Set(repositories.map(repo => repo.language).filter(Boolean))].length,
  };

  const mostStarredRepos = repositories
    .filter(repo => repo.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  const recentActivity = repositories
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Perfil do Usuário</h1>
        <p className="text-slate-400">Suas informações e estatísticas do GitHub</p>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500"></div>
        
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar_url}
                alt={user.name || user.login}
                className="w-32 h-32 rounded-full border-4 border-slate-800 bg-slate-800"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-800"></div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {user.name || user.login}
                  </h2>
                  <p className="text-xl text-slate-400 mb-2">@{user.login}</p>
                  {user.bio && (
                    <p className="text-slate-300 max-w-2xl">{user.bio}</p>
                  )}
                </div>
                
                <a
                  href={`https://github.com/${user.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  Ver no GitHub
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* User Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {user.company && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Building className="w-4 h-4 text-blue-400" />
                    <span>{user.company}</span>
                  </div>
                )}
                
                {user.location && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-red-400" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.email && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4 text-green-400" />
                    <span>{user.email}</span>
                  </div>
                )}
                
                {user.blog && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <LinkIcon className="w-4 h-4 text-purple-400" />
                    <a
                      href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400 transition-colors truncate"
                    >
                      {user.blog}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-slate-400 mt-4">
                <Calendar className="w-4 h-4" />
                <span>Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long'
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <GitBranch className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{user.public_repos}</div>
          <div className="text-sm text-slate-400">Repositórios Públicos</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.totalStars}</div>
          <div className="text-sm text-slate-400">Total de Stars</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{user.followers}</div>
          <div className="text-sm text-slate-400">Seguidores</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{user.following}</div>
          <div className="text-sm text-slate-400">Seguindo</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <BookOpen className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{user.public_gists}</div>
          <div className="text-sm text-slate-400">Gists Públicos</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <GitBranch className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stats.languages}</div>
          <div className="text-sm text-slate-400">Linguagens</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Starred Repositories */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            Repositórios Mais Populares
          </h3>
          
          {mostStarredRepos.length > 0 ? (
            <div className="space-y-4">
              {mostStarredRepos.map((repo, index) => (
                <div key={repo.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{repo.name}</h4>
                      <p className="text-sm text-slate-400 truncate max-w-xs">
                        {repo.description || 'Sem descrição'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">Nenhum repositório com stars encontrado</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-400" />
            Atividade Recente
          </h3>
          
          <div className="space-y-3">
            {recentActivity.map((repo) => (
              <div key={repo.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{repo.name}</h4>
                    <p className="text-xs text-slate-400">
                      Atualizado {new Date(repo.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                {repo.language && (
                  <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                    {repo.language}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
