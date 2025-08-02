import React, { useEffect, useMemo } from 'react';
import { 
  MapPin, Building, Mail, Calendar, GitBranch, Star, 
  Users, BookOpen, ExternalLink, Award, Activity,
  Code, GitCommit, Zap, Target, Globe, Trophy, Flame,
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart as RechartsPieChart, Pie, Cell,
  ScatterChart, Scatter
} from 'recharts';
import { useGitHub } from '../context/GitHubContext';

// Interface para contribuição por linguagem, incluindo número de repositórios, stars, commits e porcentagem
interface LanguageContribution {
  language: string;
  repos: number;
  stars: number;
  commits: number;
  percentage: number;
  color: string;
}

// Interface para badges de conquistas, com título, descrição, ícone, cor, status de ganho e progresso
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
  // Extraímos do contexto GitHub usuário, repositórios, commits e métodos auxiliares
  const { user, repositories, commits, loading, fetchUser } = useGitHub();

  // Ao montar o componente, se usuário não estiver carregado, disparar busca
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  /**
   * Cálculos avançados de estatísticas baseadas nos repositórios e usuário.
   * Usamos useMemo para evitar cálculos desnecessários.
   */
  const advancedStats = useMemo(() => {
    if (!repositories.length) return null;

    // Soma de stars, forks, watchers, issues e tamanho total
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
    const totalWatchers = repositories.reduce((sum, repo) => sum + repo.watchers_count, 0);
    const totalIssues = repositories.reduce((sum, repo) => sum + repo.open_issues_count, 0);
    const totalSize = repositories.reduce((sum, repo) => sum + repo.size, 0);

    // Linguagens únicas usadas nos repositórios
    const languages = [...new Set(repositories.map(repo => repo.language).filter(Boolean))];

    // Contagem de repositórios públicos e privados
    const publicRepos = repositories.filter(repo => !repo.private).length;
    const privateRepos = repositories.length - publicRepos;

    // Quantidade de repositórios criados por ano
    const reposByYear = repositories.reduce((acc, repo) => {
      const year = new Date(repo.created_at).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Quantidade de repositórios atualizados nos últimos 30 dias
    const recentActivity = repositories.filter(repo => {
      const daysSinceUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate <= 30;
    }).length;

    // Repositório com mais stars
    const mostStarredRepo = repositories.reduce((prev, current) => 
      prev.stargazers_count > current.stargazers_count ? prev : current
    );

    // Média de stars por repositório
    const avgStarsPerRepo = totalStars / repositories.length;

    // Streaks de commits (valores simulados, podem ser ajustados com dados reais)
    const currentStreak = 15;
    const longestStreak = 45;

    // Score do desenvolvedor com base em diversos fatores
    const developerScore = Math.min(100, (
      (totalStars * 0.3) + 
      (totalForks * 0.2) + 
      (repositories.length * 2) + 
      (languages.length * 5) +
      (user?.followers || 0) * 0.5
    ));

    // Retornamos todas as estatísticas calculadas, formatadas quando necessário
    return {
      totalRepos: repositories.length,
      totalStars,
      totalForks,
      totalWatchers,
      totalIssues,
      totalSize: Math.round(totalSize / 1024), // Convertido para MB
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
      contributionsThisYear: commits.length || 156, // Valor simulado para commits no ano
      avgCommitsPerDay: ((commits.length || 156) / 365).toFixed(1),
    };
  }, [repositories, user, commits]);

  /**
   * Calcula a contribuição por linguagem, agregando dados de repositórios, stars e commits.
   * Usamos cores distintas para cada linguagem para visualização gráfica.
   */
  const languageContributions: LanguageContribution[] = useMemo(() => {
    const langMap = new Map<string, { repos: number; stars: number; commits: number }>();

    repositories.forEach(repo => {
      if (repo.language) {
        const current = langMap.get(repo.language) || { repos: 0, stars: 0, commits: 0 };
        langMap.set(repo.language, {
          repos: current.repos + 1,
          stars: current.stars + repo.stargazers_count,
          commits: current.commits + Math.floor(Math.random() * 50) + 10, // Simulação para commits
        });
      }
    });

    // Paleta de cores para as linguagens
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#F97316'];
    const totalRepos = repositories.length;

    return Array.from(langMap.entries())
      .map(([language, data], index) => ({
        language,
        repos: data.repos,
        stars: data.stars,
        commits: data.commits,
        percentage: (data.repos / totalRepos) * 100,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.repos - a.repos)
      .slice(0, 8);
  }, [repositories]);

  /**
   * Dados simulados de atividade mensal para visualização gráfica.
   * Mostra commits, repositórios criados, stars e pull requests por mês.
   */
  const activityData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();

    return months.map((month, index) => {
      // Simulação de atividade base
      const baseActivity = Math.floor(Math.random() * 30) + 10;

      // Repositórios criados no mês e ano atuais
      const reposCreated = repositories.filter(repo => {
        const repoDate = new Date(repo.created_at);
        return repoDate.getFullYear() === currentYear && repoDate.getMonth() === index;
      }).length;

      return {
        month,
        commits: baseActivity + Math.floor(Math.random() * 20),
        repos: reposCreated,
        stars: Math.floor(Math.random() * 15),
        prs: Math.floor(Math.random() * 8) + 2,
      };
    });
  }, [repositories]);

  /**
   * Lista de badges de conquistas, cada uma com condição de ganho e progresso visualizado.
   */
  const achievements: AchievementBadge[] = useMemo(() => {
    if (!advancedStats) return [];

    return [
      {
        id: 'first-repo',
        title: 'Primeiro Repositório',
        description: 'Criou seu primeiro repositório',
        icon: GitBranch,
        color: 'text-blue-500',
        earned: advancedStats.totalRepos > 0,
      },
      {
        id: 'star-collector',
        title: 'Colecionador de Stars',
        description: 'Recebeu 100+ stars',
        icon: Star,
        color: 'text-yellow-500',
        earned: advancedStats.totalStars >= 100,
        progress: advancedStats.totalStars,
        requirement: 100,
      },
      {
        id: 'fork-master',
        title: 'Mestre dos Forks',
        description: 'Recebeu 50+ forks',
        icon: GitCommit,
        color: 'text-green-500',
        earned: advancedStats.totalForks >= 50,
        progress: advancedStats.totalForks,
        requirement: 50,
      },
      {
        id: 'polyglot',
        title: 'Poliglota',
        description: 'Usa 5+ linguagens diferentes',
        icon: Code,
        color: 'text-purple-500',
        earned: advancedStats.languages >= 5,
        progress: advancedStats.languages,
        requirement: 5,
      },
      {
        id: 'productive',
        title: 'Produtivo',
        description: 'Criou 20+ repositórios',
        icon: Zap,
        color: 'text-orange-500',
        earned: advancedStats.totalRepos >= 20,
        progress: advancedStats.totalRepos,
        requirement: 20,
      },
      {
        id: 'influencer',
        title: 'Influenciador',
        description: 'Tem 100+ seguidores',
        icon: Users,
        color: 'text-pink-500',
        earned: (user?.followers || 0) >= 100,
        progress: user?.followers || 0,
        requirement: 100,
      },
      {
        id: 'fire-streak',
        title: 'Em Chamas',
        description: 'Streak de 30+ dias',
        icon: Flame,
        color: 'text-red-500',
        earned: advancedStats.currentStreak >= 30,
        progress: advancedStats.currentStreak,
        requirement: 30,
      },
      {
        id: 'veteran',
        title: 'Veterano',
        description: '2+ anos no GitHub',
        icon: Trophy,
        color: 'text-amber-500',
        earned: advancedStats.accountAge >= 730,
      },
    ];
  }, [advancedStats, user]);

  // Renderiza tela de loading enquanto dados não estão carregados
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

  // Mensagem de erro caso usuário não esteja disponível após tentativa de carregamento
  if (!user) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-400 mb-2">Perfil não encontrado</h3>
        <p className="text-slate-500">Não foi possível carregar as informações do perfil</p>
      </div>
    );
  }

  // Renderização principal do componente com todos os dados e gráficos
  return (
    <div className="space-y-6">
      {/* Cabeçalho do perfil */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Users className="w-10 h-10 text-purple-500" />
          Perfil Avançado do Desenvolvedor
        </h1>
        <p className="text-slate-400">Análise completa da sua presença e atividade no GitHub</p>
      </div>

      {/* Cartão principal com avatar, score e dados do usuário */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        {/* Capa colorida com Developer Score */}
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
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Conteúdo do cartão */}
        <div className="px-8 pb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 -mt-20">
            {/* Avatar do usuário */}
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

            {/* Informações principais do usuário */}
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
                
                {/* Botões para GitHub e site pessoal */}
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

              {/* Dados complementares como empresa, localização, email e data de criação */}
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
                    month: 'long',
                  })}</span>
                </div>
              </div>

              {/* Estatísticas rápidas como streak, commits por dia, ativos e linguagens */}
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
                      <Code className="w-4 h-4 text-yellow-400" />
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

      {/* Grade de estatísticas avançadas com ícones e valores */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Total de Stars */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center hover:border-yellow-500/50 transition-all duration-300 group">
          <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-bold text-white">{advancedStats?.totalStars || 0}</div>
          <div className="text-sm text-slate-400">Total de Stars</div>
          {advancedStats && (
            <div className="text-xs text-yellow-400 mt-1">~{advancedStats.avgStarsPerRepo} por repo</div>
          )}
        </div>

        {/* Seguidores */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center hover:border-green-500/50 transition-all duration-300 group">
          <Users className="w-8 h-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-bold text-white">{user.followers}</div>
          <div className="text-sm text-slate-400">Seguidores</div>
          <div className="text-xs text-green-400 mt-1">{user.following} seguindo</div>
        </div>

        {/* Total de Forks */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center hover:border-purple-500/50 transition-all duration-300 group">
          <GitCommit className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-bold text-white">{advancedStats?.totalForks || 0}</div>
          <div className="text-sm text-slate-400">Total de Forks</div>
          {advancedStats && (
            <div className="text-xs text-purple-400 mt-1">{advancedStats.totalWatchers} watchers</div>
          )}
        </div>

        {/* Gists Públicos */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center hover:border-orange-500/50 transition-all duration-300 group">
          <BookOpen className="w-8 h-8 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-bold text-white">{user.public_gists}</div>
          <div className="text-sm text-slate-400">Gists Públicos</div>
          {advancedStats && (
            <div className="text-xs text-orange-400 mt-1">{advancedStats.contributionsThisYear} contribuições</div>
          )}
        </div>

        {/* Linguagens */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center hover:border-cyan-500/50 transition-all duration-300 group">
          <Code className="w-8 h-8 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-bold text-white">{advancedStats?.languages || 0}</div>
          <div className="text-sm text-slate-400">Linguagens</div>
          {advancedStats && (
            <div className="text-xs text-cyan-400 mt-1">{advancedStats.totalSize} MB total</div>
          )}
        </div>
      </div>

      {/* Seção de conquistas e badges */}
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
                  
                  {/* Barra de progresso para conquistas parciais */}
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
                  
                  {/* Exibição do progresso em números */}
                  {achievement.progress !== undefined && achievement.requirement && (
                    <p className="text-xs text-slate-500">
                      {achievement.progress}/{achievement.requirement}
                    </p>
                  )}
                </div>
                
                {/* Checkmark para conquistas alcançadas */}
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

      {/* Grade de analytics com gráficos diversos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Contribuições por Linguagem (PieChart) */}
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
            
            {/* Lista de linguagens com detalhes */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {languageContributions.map((lang) => (
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

        {/* Atividade ao longo do ano (AreaChart) */}
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

        {/* Performance dos repositórios (ScatterChart) */}
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
    </div>
  );
};

export default UserProfile;
