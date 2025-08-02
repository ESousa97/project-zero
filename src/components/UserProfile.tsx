import React, { useEffect, useMemo } from 'react';
import { 
  MapPin, Link as LinkIcon, Building, Mail, Calendar, GitBranch, Star, 
  Users, BookOpen, ExternalLink, Award, TrendingUp, Activity, Clock,
  Code, Eye, GitCommit, Zap, Target, Globe, Shield, Coffee, Heart,
  Trophy, Flame, BarChart3, PieChart, LineChart
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, RadialBarChart, RadialBar,
  LineChart as RechartsLineChart, Line, ScatterChart, Scatter
} from 'recharts';
import { useGitHub } from '../context/GitHubContext';

interface ContributionData {
  date: string;
  count: number;
  level: number;
}

interface LanguageContribution {
  language: string;
  repos: number;
  stars: number;
  commits: number;
  percentage: number;
  color: string;
}

interface ActivityPattern {
  hour: number;
  day: string;
  commits: number;
  intensity: number;
}

interface CollaborationNetwork {
  collaborator: string;
  sharedRepos: number;
  totalContributions: number;
  relationship: 'frequent' | 'occasional' | 'rare';
}

interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  earned: boolean;
  progress?: number;
  requirement?: number;
}

const UserProfile: React.FC = () => {
  const { user, repositories, commits, loading, fetchUser } = useGitHub();

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  // Estatísticas avançadas calculadas
  const advancedStats = useMemo(() => {
    if (!repositories.length) return null;

    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
    const totalWatchers = repositories.reduce((sum, repo) => sum + repo.watchers_count, 0);
    const totalIssues = repositories.reduce((sum, repo) => sum + repo.open_issues_count, 0);
    const totalSize = repositories.reduce((sum, repo) => sum + repo.size, 0);
    
    const languages = [...new Set(repositories.map(repo => repo.language).filter(Boolean))];
    const publicRepos = repositories.filter(repo => !repo.private).length;
    const privateRepos = repositories.length - publicRepos;
    
    // Repositórios por ano
    const reposByYear = repositories.reduce((acc, repo) => {
      const year = new Date(repo.created_at).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Atividade recente (últimos 30 dias)
    const recentActivity = repositories.filter(repo => {
      const daysSinceUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate <= 30;
    }).length;

    // Repositórios mais populares
    const mostStarredRepo = repositories.reduce((prev, current) => 
      prev.stargazers_count > current.stargazers_count ? prev : current
    );

    // Média de stars por repositório
    const avgStarsPerRepo = totalStars / repositories.length;

    // Streak de commits (simulado)
    const currentStreak = 15; // Seria calculado baseado no histórico real
    const longestStreak = 45;

    // Score de desenvolvedor (algoritmo personalizado)
    const developerScore = Math.min(100, (
      (totalStars * 0.3) + 
      (totalForks * 0.2) + 
      (repositories.length * 2) + 
      (languages.length * 5) +
      (user?.followers || 0) * 0.5
    ));

    return {
      totalRepos: repositories.length,
      totalStars,
      totalForks,
      totalWatchers,
      totalIssues,
      totalSize: Math.round(totalSize / 1024), // MB
      languages: languages.length,
      publicRepos,
      privateRepos,
      reposByYear,
      recentActivity,
      mostStarredRepo: mostStarredRepo.name,
      mostStarredRepoStars: mostStarredRepo.stargazers_count,
      avgStarsPerRepo: avgStarsPerRepo.toFixed(1),
      currentStreak,
      longestStreak,
      developerScore: Math.round(developerScore),
      accountAge: Math.floor((Date.now() - new Date(user?.created_at || '').getTime()) / (1000 * 60 * 60 * 24)),
      contributionsThisYear: commits.length || 156, // Simulado
      avgCommitsPerDay: ((commits.length || 156) / 365).toFixed(1)
    };
  }, [repositories, user, commits]);

  // Contribuições por linguagem
  const languageContributions: LanguageContribution[] = useMemo(() => {
    const langMap = new Map<string, { repos: number; stars: number; commits: number }>();
    
    repositories.forEach(repo => {
      if (repo.language) {
        const current = langMap.get(repo.language) || { repos: 0, stars: 0, commits: 0 };
        langMap.set(repo.language, {
          repos: current.repos + 1,
          stars: current.stars + repo.stargazers_count,
          commits: current.commits + Math.floor(Math.random() * 50) + 10 // Simulado
        });
      }
    });

    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#F97316'];
    const totalRepos = repositories.length;

    return Array.from(langMap.entries())
      .map(([language, data], index) => ({
        language,
        repos: data.repos,
        stars: data.stars,
        commits: data.commits,
        percentage: (data.repos / totalRepos) * 100,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.repos - a.repos)
      .slice(0, 8);
  }, [repositories]);

  // Dados de atividade ao longo do tempo
  const activityData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      // Simulando dados de atividade
      const baseActivity = Math.floor(Math.random() * 30) + 10;
      const reposCreated = repositories.filter(repo => {
        const repoDate = new Date(repo.created_at);
        return repoDate.getFullYear() === currentYear && repoDate.getMonth() === index;
      }).length;
      
      return {
        month,
        commits: baseActivity + Math.floor(Math.random() * 20),
        repos: reposCreated,
        stars: Math.floor(Math.random() * 15),
        prs: Math.floor(Math.random() * 8) + 2
      };
    });
  }, [repositories]);

  // Badges de conquistas
  const achievements: AchievementBadge[] = useMemo(() => {
    if (!advancedStats) return [];

    return [
      {
        id: 'first-repo',
        title: 'Primeiro Repositório',
        description: 'Criou seu primeiro repositório',
        icon: GitBranch,
        color: 'text-blue-500',
        earned: advancedStats.totalRepos > 0
      },
      {
        id: 'star-collector',
        title: 'Colecionador de Stars',
        description: 'Recebeu 100+ stars',
        icon: Star,
        color: 'text-yellow-500',
        earned: advancedStats.totalStars >= 100,
        progress: advancedStats.totalStars,
        requirement: 100
      },
      {
        id: 'fork-master',
        title: 'Mestre dos Forks',
        description: 'Recebeu 50+ forks',
        icon: GitCommit,
        color: 'text-green-500',
        earned: advancedStats.totalForks >= 50,
        progress: advancedStats.totalForks,
        requirement: 50
      },
      {
        id: 'polyglot',
        title: 'Poliglota',
        description: 'Usa 5+ linguagens diferentes',
        icon: Code,
        color: 'text-purple-500',
        earned: advancedStats.languages >= 5,
        progress: advancedStats.languages,
        requirement: 5
      },
      {
        id: 'productive',
        title: 'Produtivo',
        description: 'Criou 20+ repositórios',
        icon: Zap,
        color: 'text-orange-500',
        earned: advancedStats.totalRepos >= 20,
        progress: advancedStats.totalRepos,
        requirement: 20
      },
      {
        id: 'influencer',
        title: 'Influenciador',
        description: 'Tem 100+ seguidores',
        icon: Users,
        color: 'text-pink-500',
        earned: (user?.followers || 0) >= 100,
        progress: user?.followers || 0,
        requirement: 100
      },
      {
        id: 'fire-streak',
        title: 'Em Chamas',
        description: 'Streak de 30+ dias',
        icon: Flame,
        color: 'text-red-500',
        earned: advancedStats.currentStreak >= 30,
        progress: advancedStats.currentStreak,
        requirement: 30
      },
      {
        id: 'veteran',
        title: 'Veterano',
        description: '2+ anos no GitHub',
        icon: Trophy,
        color: 'text-amber-500',
        earned: advancedStats.accountAge >= 730
      }
    ];
  }, [advancedStats, user]);

  // Padrões de atividade (heatmap simulado)
  const activityPatterns: ActivityPattern[] = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const patterns: ActivityPattern[] = [];
    
    days.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        const baseIntensity = day === 'Sáb' || day === 'Dom' ? 0.3 : 0.7;
        const hourFactor = hour >= 9 && hour <= 18 ? 1 : 0.4;
        const commits = Math.floor(Math.random() * 10 * baseIntensity * hourFactor);
        
        patterns.push({
          hour,
          day,
          commits,
          intensity: Math.min(100, commits * 10)
        });
      }
    });
    
    return patterns;
  }, []);

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando perfil detalhado...</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Users className="w-10 h-10 text-purple-500" />
          Perfil Avançado do Desenvolvedor
        </h1>
        <p className="text-slate-400">Análise completa da sua presença e atividade no GitHub</p>
      </div>

      {/* Enhanced Profile Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        {/* Cover Image */}
        <div className="h-40 bg-gradient-to-r from-blue-600 via-purple-700 to-pink-600 relative">
          <div className="absolute inset-0 bg-black/20"></div>
          {advancedStats && (
            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-3">
              <div className="text-center">
                <p className="text-white/80 text-sm">Developer Score</p>
                <p className="text-2xl font-bold text-white">{advancedStats.developerScore}</p>
                <div className="w-16 h-1 bg-white/20 rounded-full mt-1">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${advancedStats.developerScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-8 pb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 -mt-20">
            {/* Avatar and Basic Info */}
            <div className="relative">
              <img
                src={user.avatar_url}
                alt={user.name || user.login}
                className="w-32 h-32 rounded-full border-4 border-slate-800 bg-slate-800 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-4 border-slate-800 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                    {user.name || user.login}
                    {user.hireable && <Award className="w-6 h-6 text-green-400" />}
                  </h2>
                  <p className="text-xl text-slate-400 mb-2">@{user.login}</p>
                  {user.bio && (
                    <p className="text-slate-300 max-w-2xl leading-relaxed">{user.bio}</p>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <a
                    href={`https://github.com/${user.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                  >
                    Ver no GitHub
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  
                  {user.blog && (
                    <a
                      href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>

              {/* User Details Grid */}
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
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Desde {new Date(user.created_at).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long'
                  })}</span>
                </div>
              </div>

              {/* Quick Stats */}
              {advancedStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-slate-400 text-sm">Streak Atual</span>
                    </div>
                    <p className="text-xl font-bold text-white">{advancedStats.currentStreak} dias</p>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-green-400" />
                      <span className="text-slate-400 text-sm">Commits/Dia</span>
                    </div>
                    <p className="text-xl font-bold text-white">{advancedStats.avgCommitsPerDay}</p>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-400 text-sm">Ativos/Mês</span>
                    </div>
                    <p className="text-xl font-bold text-white">{advancedStats.recentActivity}</p>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Coffee className="w-4 h-4 text-yellow-400" />
                      <span className="text-slate-400 text-sm">Linguagens</span>
                    </div>
                    <p className="text-xl font-bold text-white">{advancedStats.languages}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center hover:border-blue-500/50 transition-all duration-300 group">
          <GitBranch className="w-8 h-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-bold text-white">{user.public_repos}</div>
          <div className="text-sm text-slate-400">Repos Públicos</div>
          {advancedStats && (
            <div className="text-xs text-blue-400 mt-1">+{advancedStats.privateRepos} privados</div>
          )}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center hover:border-yellow-500/50 transition-all duration-300 group">
          <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-bold text-white">{advancedStats?.totalStars || 0}</div>
          <div className="text-sm text-slate-400">Total de Stars</div>
          {advancedStats && (
            <div className="text-xs text-yellow-400 mt-1">~{advancedStats.avgStarsPerRepo} por repo</div>
          )}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center hover:border-green-500/50 transition-all duration-300 group">
          <Users className="w-8 h-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-bold text-white">{user.followers}</div>
          <div className="text-sm text-slate-400">Seguidores</div>
          <div className="text-xs text-green-400 mt-1">{user.following} seguindo</div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center hover:border-purple-500/50 transition-all duration-300 group">
          <GitCommit className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-bold text-white">{advancedStats?.totalForks || 0}</div>
          <div className="text-sm text-slate-400">Total de Forks</div>
          {advancedStats && (
            <div className="text-xs text-purple-400 mt-1">{advancedStats.totalWatchers} watchers</div>
          )}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center hover:border-orange-500/50 transition-all duration-300 group">
          <BookOpen className="w-8 h-8 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-bold text-white">{user.public_gists}</div>
          <div className="text-sm text-slate-400">Gists Públicos</div>
          {advancedStats && (
            <div className="text-xs text-orange-400 mt-1">{advancedStats.contributionsThisYear} contribuições</div>
          )}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center hover:border-cyan-500/50 transition-all duration-300 group">
          <Code className="w-8 h-8 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-bold text-white">{advancedStats?.languages || 0}</div>
          <div className="text-sm text-slate-400">Linguagens</div>
          {advancedStats && (
            <div className="text-xs text-cyan-400 mt-1">{advancedStats.totalSize} MB total</div>
          )}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
          Conquistas e Badges
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div 
                key={achievement.id}
                className={`relative p-4 rounded-lg border transition-all duration-300 ${
                  achievement.earned 
                    ? 'bg-slate-700/50 border-green-500/30 hover:border-green-500/50' 
                    : 'bg-slate-700/20 border-slate-600 opacity-60'
                }`}
              >
                <div className="text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${achievement.color}`} />
                  <h4 className="font-semibold text-white text-sm mb-1">{achievement.title}</h4>
                  <p className="text-xs text-slate-400 mb-2">{achievement.description}</p>
                  
                  {achievement.requirement && (
                    <div className="w-full bg-slate-600 rounded-full h-1.5 mb-2">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-1000 ${
                          achievement.earned ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ 
                          width: `${Math.min(100, ((achievement.progress || 0) / achievement.requirement) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  )}
                  
                  {achievement.progress !== undefined && achievement.requirement && (
                    <p className="text-xs text-slate-500">
                      {achievement.progress}/{achievement.requirement}
                    </p>
                  )}
                </div>
                
                {achievement.earned && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Language Contributions */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Code className="w-5 h-5 mr-2 text-blue-400" />
            Contribuições por Linguagem
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={languageContributions}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="repos"
                  label={({ language, percentage }) => `${language} ${percentage.toFixed(1)}%`}
                >
                  {languageContributions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {languageContributions.map((lang, index) => (
                <div key={lang.language} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: lang.color }}
                    />
                    <div>
                      <p className="font-semibold text-white text-sm">{lang.language}</p>
                      <p className="text-xs text-slate-400">{lang.repos} repositórios</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-yellow-400">{lang.stars} ★</p>
                    <p className="text-green-400">{lang.commits} commits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Over Time */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-400" />
            Atividade ao Longo do Ano
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Area type="monotone" dataKey="commits" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="repos" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="prs" stackId="3" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Contribution Heatmap */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-400" />
            Padrão de Atividade Semanal
          </h3>
          
          <div className="space-y-3">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="flex items-center gap-2">
                <span className="text-slate-400 text-sm w-8">{day}</span>
                <div className="flex gap-1">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const pattern = activityPatterns.find(p => p.day === day && p.hour === hour);
                    const intensity = pattern?.intensity || 0;
                    return (
                      <div
                        key={hour}
                        className="w-3 h-3 rounded-sm transition-all duration-200 hover:scale-125"
                        style={{
                          backgroundColor: intensity > 70 ? '#10B981' :
                                         intensity > 40 ? '#F59E0B' :
                                         intensity > 20 ? '#3B82F6' :
                                         intensity > 0 ? '#6B7280' : '#374151'
                        }}
                        title={`${day} ${hour}:00 - ${pattern?.commits || 0} commits`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
            <span>Menos</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-slate-600 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            </div>
            <span>Mais</span>
          </div>
        </div>

        {/* Repository Performance Radar */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-400" />
            Performance dos Repositórios
          </h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart data={repositories.slice(0, 20).map(repo => ({
              name: repo.name,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              size: repo.size / 1024,
              age: Math.floor((Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24))
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                dataKey="stars" 
                name="Stars" 
                stroke="#9CA3AF"
                label={{ value: 'Stars', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="number" 
                dataKey="forks" 
                name="Forks" 
                stroke="#9CA3AF"
                label={{ value: 'Forks', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 shadow-lg">
                        <p className="text-white font-semibold">{data.name}</p>
                        <p className="text-yellow-400">★ {data.stars} stars</p>
                        <p className="text-green-400">🍴 {data.forks} forks</p>
                        <p className="text-blue-400">📦 {data.size.toFixed(1)} MB</p>
                        <p className="text-purple-400">📅 {data.age} dias</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter dataKey="size" fill="#8B5CF6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Repositories Enhanced */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-400" />
          Repositórios em Destaque
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {repositories
            .sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count))
            .slice(0, 6)
            .map((repo, index) => (
              <div key={repo.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 hover:border-blue-500/50 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {repo.name}
                      </h4>
                      <p className="text-xs text-slate-400">{repo.language || 'Unknown'}</p>
                    </div>
                  </div>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                  {repo.description || 'Sem descrição disponível'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3 h-3" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <GitCommit className="w-3 h-3" />
                      {repo.forks_count}
                    </span>
                    <span className="flex items-center gap-1 text-green-400">
                      <Eye className="w-3 h-3" />
                      {repo.watchers_count}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-500">
                    {Math.floor((Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24))} dias atrás
                  </div>
                </div>
                
                {/* Repository Health Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Saúde do Repositório</span>
                    <span>{Math.min(100, repo.stargazers_count + repo.forks_count + repo.watchers_count)}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, repo.stargazers_count + repo.forks_count + repo.watchers_count)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Additional Insights */}
      {advancedStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Career Milestones */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Marcos da Carreira
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Primeiro Repositório</p>
                  <p className="text-slate-400 text-sm">
                    {new Date(repositories[repositories.length - 1]?.created_at || '').toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Repo Mais Popular</p>
                  <p className="text-slate-400 text-sm">
                    {advancedStats.mostStarredRepo} ({advancedStats.mostStarredRepoStars} ★)
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Streak Mais Longo</p>
                  <p className="text-slate-400 text-sm">{advancedStats.longestStreak} dias consecutivos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Development Focus */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-400" />
              Foco de Desenvolvimento
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Frontend</span>
                  <span className="text-blue-400">65%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Backend</span>
                  <span className="text-green-400">45%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Mobile</span>
                  <span className="text-purple-400">30%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">DevOps</span>
                  <span className="text-orange-400">25%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Community Impact */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-400" />
              Impacto na Comunidade
            </h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{advancedStats.totalStars + advancedStats.totalForks}</p>
                <p className="text-slate-400 text-sm">Interações Totais</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-green-400">{Math.floor(advancedStats.totalStars / advancedStats.totalRepos * 10)}</p>
                  <p className="text-slate-400 text-xs">Score de Qualidade</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-400">{Math.floor(user.followers / 10)}</p>
                  <p className="text-slate-400 text-xs">Influência</p>
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                <p className="text-white font-medium">Rank Estimado</p>
                <p className="text-yellow-400 text-sm">
                  {advancedStats.developerScore >= 80 ? 'Expert' :
                   advancedStats.developerScore >= 60 ? 'Avançado' :
                   advancedStats.developerScore >= 40 ? 'Intermediário' : 'Iniciante'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
