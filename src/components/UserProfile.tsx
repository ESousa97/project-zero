import React, { useEffect, useMemo, useCallback } from 'react';
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
import { CHART_COLORS, CHART_SURFACE_COLORS, DEFAULT_TOOLTIP_STYLE } from '../constants/chartTheme';
import type { User } from '../types/github';

interface LanguageContribution {
  language: string;
  repos: number;
  stars: number;
  commits: number;
  percentage: number;
  color: string;
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

interface UserProfileContentProps {
  user: User;
  advancedStats: ReturnType<typeof calculateAdvancedStats>;
  achievements: AchievementBadge[];
  languageContributions: LanguageContribution[];
  activityData: ReturnType<typeof buildActivityData>;
  repositoryPerformanceData: ReturnType<typeof buildRepositoryPerformanceData>;
}

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const stableHash = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const deterministicRange = (seed: string, min: number, max: number): number => {
  const span = max - min + 1;
  return min + (stableHash(seed) % span);
};

const resolveReferenceTimestamp = (
  repositories: Array<{ updated_at: string }> ,
  fallbackCreatedAt?: string,
): number => {
  const latestRepoUpdate = repositories.reduce((latest, repo) => {
    const timestamp = new Date(repo.updated_at).getTime();
    return Number.isFinite(timestamp) ? Math.max(latest, timestamp) : latest;
  }, 0);

  const fallbackTimestamp = fallbackCreatedAt ? new Date(fallbackCreatedAt).getTime() : 0;
  return Math.max(latestRepoUpdate, Number.isFinite(fallbackTimestamp) ? fallbackTimestamp : 0);
};

const calculateAdvancedStats = ({
  repositories,
  followers,
  userCreatedAt,
  commitsLength,
  referenceTimestamp,
}: {
  repositories: Array<{
    stargazers_count: number;
    forks_count: number;
    watchers_count: number;
    open_issues_count: number;
    size: number;
    language: string | null;
    private: boolean;
    created_at: string;
    updated_at: string;
    name: string;
  }>;
  followers: number;
  userCreatedAt?: string;
  commitsLength: number;
  referenceTimestamp: number;
}) => {
  if (!repositories.length) return null;

  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
  const totalWatchers = repositories.reduce((sum, repo) => sum + repo.watchers_count, 0);
  const totalIssues = repositories.reduce((sum, repo) => sum + repo.open_issues_count, 0);
  const totalSize = repositories.reduce((sum, repo) => sum + repo.size, 0);

  const languages = [...new Set(repositories.map(repo => repo.language).filter(Boolean))];
  const publicRepos = repositories.filter(repo => !repo.private).length;
  const privateRepos = repositories.length - publicRepos;

  const reposByYear = repositories.reduce((acc, repo) => {
    const year = new Date(repo.created_at).getFullYear();
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const recentActivity = repositories.filter(repo => {
    const updatedAt = new Date(repo.updated_at).getTime();
    if (!Number.isFinite(updatedAt)) {
      return false;
    }
    const daysSinceUpdate = (referenceTimestamp - updatedAt) / DAY_IN_MS;
    return daysSinceUpdate <= 30;
  }).length;

  const mostStarredRepo = repositories.reduce((prev, current) =>
    prev.stargazers_count > current.stargazers_count ? prev : current,
  );

  const avgStarsPerRepo = totalStars / repositories.length;
  const currentStreak = 15;
  const longestStreak = 45;

  const developerScore = Math.min(100, (
    (totalStars * 0.3) +
    (totalForks * 0.2) +
    (repositories.length * 2) +
    (languages.length * 5) +
    (followers * 0.5)
  ));

  const userCreatedTimestamp = userCreatedAt ? new Date(userCreatedAt).getTime() : 0;
  const validUserCreatedTimestamp = Number.isFinite(userCreatedTimestamp) ? userCreatedTimestamp : referenceTimestamp;

  return {
    totalRepos: repositories.length,
    totalStars,
    totalForks,
    totalWatchers,
    totalIssues,
    totalSize: Math.round(totalSize / 1024),
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
    accountAge: Math.floor((referenceTimestamp - validUserCreatedTimestamp) / DAY_IN_MS),
    contributionsThisYear: commitsLength || 156,
    avgCommitsPerDay: ((commitsLength || 156) / 365).toFixed(1),
  };
};

const buildLanguageContributions = (
  repositories: Array<{ id: number; language: string | null; stargazers_count: number }>,
): LanguageContribution[] => {
  if (!repositories.length) return [];

  const langMap = new Map<string, { repos: number; stars: number; commits: number }>();

  repositories.forEach(repo => {
    if (repo.language) {
      const current = langMap.get(repo.language) || { repos: 0, stars: 0, commits: 0 };
      const estimatedCommits = deterministicRange(`${repo.id}-${repo.language}-commits`, 10, 59);

      langMap.set(repo.language, {
        repos: current.repos + 1,
        stars: current.stars + repo.stargazers_count,
        commits: current.commits + estimatedCommits,
      });
    }
  });

  const totalRepos = repositories.length;

  return Array.from(langMap.entries())
    .map(([language, data], index) => ({
      language,
      repos: data.repos,
      stars: data.stars,
      commits: data.commits,
      percentage: (data.repos / totalRepos) * 100,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.repos - a.repos)
    .slice(0, 8);
};

const buildActivityData = (
  repositories: Array<{ id: number; created_at: string }>,
  referenceTimestamp: number,
) => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentYear = new Date(referenceTimestamp).getFullYear();

  return months.map((month, index) => {
    const baseActivity = deterministicRange(`${currentYear}-${index}-base-${repositories.length}`, 10, 39);

    const reposCreated = repositories.filter(repo => {
      const repoDate = new Date(repo.created_at);
      return repoDate.getFullYear() === currentYear && repoDate.getMonth() === index;
    }).length;

    return {
      month,
      commits: baseActivity + deterministicRange(`${month}-${index}-commits`, 0, 19),
      repos: reposCreated,
      stars: deterministicRange(`${month}-${index}-stars`, 0, 14),
      prs: deterministicRange(`${month}-${index}-prs`, 2, 9),
    };
  });
};

const buildRepositoryPerformanceData = (
  repositories: Array<{ name: string; stargazers_count: number; forks_count: number; size: number; created_at: string }>,
  referenceTimestamp: number,
) => repositories.slice(0, 20).map(repo => ({
  name: repo.name,
  stars: repo.stargazers_count,
  forks: repo.forks_count,
  size: repo.size / 1024,
  age: Math.floor((referenceTimestamp - new Date(repo.created_at).getTime()) / DAY_IN_MS),
}));

const buildAchievements = (
  advancedStats: ReturnType<typeof calculateAdvancedStats>,
  followers: number,
): AchievementBadge[] => {
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
      earned: followers >= 100,
      progress: followers,
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
};

const UserProfileContent: React.FC<UserProfileContentProps> = ({
  user,
  advancedStats,
  achievements,
  languageContributions,
  activityData,
  repositoryPerformanceData,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Users className="w-10 h-10 text-purple-500" />
          Perfil Avançado do Desenvolvedor
        </h1>
        <p className="text-slate-400">Análise completa da sua presença e atividade no GitHub</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
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

        <div className="px-8 pb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 -mt-20">
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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-400" />
            Atividade ao Longo do Ano
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_SURFACE_COLORS.grid} />
              <XAxis dataKey="month" stroke={CHART_SURFACE_COLORS.axis} fontSize={12} />
              <YAxis stroke={CHART_SURFACE_COLORS.axis} fontSize={12} />
              <Tooltip contentStyle={DEFAULT_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="commits" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="repos" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="prs" stackId="3" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-400" />
            Performance dos Repositórios
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart data={repositoryPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_SURFACE_COLORS.grid} />
              <XAxis
                type="number"
                dataKey="stars"
                name="Stars"
                stroke={CHART_SURFACE_COLORS.axis}
                label={{ value: 'Stars', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                type="number"
                dataKey="forks"
                name="Forks"
                stroke={CHART_SURFACE_COLORS.axis}
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
                        <p className="text-green-400">Forks: {data.forks}</p>
                        <p className="text-blue-400">Tamanho: {data.size.toFixed(1)} MB</p>
                        <p className="text-purple-400">Dias: {data.age}</p>
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

const UserProfile: React.FC = () => {
  const { user, repositories, commits, loading, fetchUser } = useGitHub();

  const memoizedFetchUser = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!user && !loading) {
      memoizedFetchUser();
    }
  }, [user, loading, memoizedFetchUser]);

  const referenceTimestamp = useMemo(
    () => resolveReferenceTimestamp(repositories, user?.created_at),
    [repositories, user?.created_at],
  );

  const advancedStats = useMemo(() => {
    return calculateAdvancedStats({
      repositories,
      followers: user?.followers || 0,
      userCreatedAt: user?.created_at,
      commitsLength: commits.length,
      referenceTimestamp,
    });
  }, [repositories, user?.followers, user?.created_at, commits.length, referenceTimestamp]);

  const languageContributions: LanguageContribution[] = useMemo(() => {
    return buildLanguageContributions(repositories);
  }, [repositories]);

  const activityData = useMemo(() => {
    return buildActivityData(repositories, referenceTimestamp);
  }, [repositories, referenceTimestamp]);

  const achievements: AchievementBadge[] = useMemo(() => {
    return buildAchievements(advancedStats, user?.followers || 0);
  }, [advancedStats, user?.followers]);

  const repositoryPerformanceData = useMemo(
    () => buildRepositoryPerformanceData(repositories, referenceTimestamp),
    [repositories, referenceTimestamp],
  );

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
    <UserProfileContent
      user={user}
      advancedStats={advancedStats}
      achievements={achievements}
      languageContributions={languageContributions}
      activityData={activityData}
      repositoryPerformanceData={repositoryPerformanceData}
    />
  );
};

export default UserProfile;
