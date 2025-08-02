import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  Repository,
  Commit,
  User,
  Event,
  Organization,
} from '../types/github';

interface GitHubContextType {
  token: string;
  setToken: (token: string) => void;
  repositories: Repository[];
  commits: Commit[];
  user: User | null;

  loading: boolean;
  loadingCommits: boolean;
  loadingRepositories: boolean;
  loadingUser: boolean;

  error: string;
  commitError: string;
  repositoryError: string;
  userError: string;

  branches: string[];
  collaborators: string[];
  languages: string[];
  tags: string[];
  releases: unknown[];
  issues: unknown[];
  pullRequests: unknown[];

  fetchRepositories: () => Promise<void>;
  fetchCommits: (repo: string, branch?: string, options?: CommitFetchOptions) => Promise<void>;
  fetchUser: () => Promise<void>;
  fetchBranches: (repo: string) => Promise<void>;
  fetchCollaborators: (repo: string) => Promise<void>;
  fetchLanguages: (repo: string) => Promise<void>;
  fetchTags: (repo: string) => Promise<void>;
  fetchReleases: (repo: string) => Promise<void>;
  fetchIssues: (repo: string, state?: 'open' | 'closed' | 'all') => Promise<void>;
  fetchPullRequests: (repo: string, state?: 'open' | 'closed' | 'all') => Promise<void>;

  fetchCommitDetails: (repo: string, sha: string) => Promise<Commit | null>;
  fetchRepositoryStats: (repo: string) => Promise<unknown | null>;
  fetchContributorStats: (repo: string) => Promise<unknown[]>;
  fetchCodeFrequency: (repo: string) => Promise<unknown[]>;
  fetchPunchCard: (repo: string) => Promise<unknown[]>;

  clearError: () => void;
  clearAllErrors: () => void;
  searchRepositories: (query: string, options?: SearchOptions) => Promise<Repository[]>;
  getRepositoryContents: (repo: string, path?: string, ref?: string) => Promise<unknown[]>;

  clearCache: () => void;
  refreshAll: () => Promise<void>;
}

interface CommitFetchOptions {
  since?: string;
  until?: string;
  author?: string;
  path?: string;
  per_page?: number;
  page?: number;
}

interface SearchOptions {
  sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
  order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

// Cache duration definido fora para evitar warning no useCallback
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export const useGitHub = (): GitHubContextType => {
  const context = useContext(GitHubContext);
  if (!context) throw new Error('useGitHub must be used within a GitHubProvider');
  return context;
};

export const GitHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados principais
  const [token, setToken] = useState<string>(() => localStorage.getItem('github_token') || '');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Dados aprimorados
  const [branches, setBranches] = useState<string[]>([]);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [releases, setReleases] = useState<unknown[]>([]);
  const [issues, setIssues] = useState<unknown[]>([]);
  const [pullRequests, setPullRequests] = useState<unknown[]>([]);

  // Estados de loading
  const [loading, setLoading] = useState(false);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  // Estados de erro
  const [error, setError] = useState('');
  const [commitError, setCommitError] = useState('');
  const [repositoryError, setRepositoryError] = useState('');
  const [userError, setUserError] = useState('');

  // Cache para evitar chamadas duplicadas
  const [cache, setCache] = useState<Map<string, { data: unknown; timestamp: number }>>(new Map());

  // Funções utilitárias para limpar erros
  const clearError = useCallback(() => setError(''), []);
  const clearAllErrors = useCallback(() => {
    setError('');
    setCommitError('');
    setRepositoryError('');
    setUserError('');
  }, []);

  // Atualiza token e limpa dados
  const handleSetToken = useCallback(
    (newToken: string) => {
      setToken(newToken);
      localStorage.setItem('github_token', newToken);
      setRepositories([]);
      setCommits([]);
      setUser(null);
      clearAllErrors();
      setCache(new Map());
    },
    [clearAllErrors]
  );

  // Requisição genérica com cache
  const makeRequest = useCallback(
    async (url: string, useCache = true): Promise<unknown> => {
      if (!token) throw new Error('Token do GitHub é obrigatório');

      if (useCache) {
        const cached = cache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          return cached.data;
        }
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();

      if (useCache) {
        setCache((prev) => new Map(prev.set(url, { data, timestamp: Date.now() })));
      }

      return data;
    },
    [token, cache]
  );

  // Requisição paginada para obter todos os dados (maxPages limita para evitar loop infinito)
  const makePaginatedRequest = useCallback(
    async (baseUrl: string, maxPages = 20): Promise<unknown[]> => {
      let allData: unknown[] = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages && page <= maxPages) {
        const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}per_page=100&page=${page}`;

        try {
          const data = await makeRequest(url);
          if (Array.isArray(data)) {
            allData = allData.concat(data);
            hasMorePages = data.length === 100;
          } else {
            hasMorePages = false;
          }
          page++;
        } catch (_err) {
          console.error(`Erro ao buscar página ${page}:`, _err);
          hasMorePages = false;
        }
      }
      return allData;
    },
    [makeRequest]
  );

  // Busca repositórios com enrich nos dados (tipagem corrigida)
  const fetchRepositories = useCallback(async () => {
    setLoadingRepositories(true);
    setRepositoryError('');
    try {
      const data = await makePaginatedRequest('https://api.github.com/user/repos?sort=updated');

      const enrichedRepos = await Promise.all(
        (data as Repository[]).map(async (repo) => {
          try {
            const [languagesData, contributorsData] = await Promise.all([
              makeRequest(`https://api.github.com/repos/${repo.full_name}/languages`).catch(() => ({})),
              makeRequest(`https://api.github.com/repos/${repo.full_name}/contributors?per_page=10`).catch(() => []),
            ]);
            return {
              ...repo,
              languages_data: languagesData as { [key: string]: number },
              contributors_data: contributorsData as unknown[],
              contributor_count: (contributorsData as unknown[]).length,
            };
          } catch (_err) {
            console.error(`Erro ao enriquecer repo ${repo.name}:`, _err);
            return repo;
          }
        })
      );

      setRepositories(
        enrichedRepos.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()) as Repository[]
      );
    } catch (err) {
      setRepositoryError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoadingRepositories(false);
    }
  }, [makePaginatedRequest, makeRequest]);

  // Busca commits reais e enriquece com stats
  const fetchCommits = useCallback(
    async (repo: string, branch = 'main', options: CommitFetchOptions = {}) => {
      setLoadingCommits(true);
      setCommitError('');
      try {
        const params = new URLSearchParams({
          sha: branch,
          per_page: (options.per_page || 100).toString(),
          page: (options.page || 1).toString(),
        });

        if (options.since) params.append('since', options.since);
        if (options.until) params.append('until', options.until);
        if (options.author) params.append('author', options.author);
        if (options.path) params.append('path', options.path);

        const url = `https://api.github.com/repos/${repo}/commits?${params.toString()}`;
        const data = await makeRequest(url);

        const enrichedCommits = await Promise.all(
          (data as Commit[]).map(async (commit) => {
            try {
              const detailedCommit = await makeRequest(`https://api.github.com/repos/${repo}/commits/${commit.sha}`);
              return {
                ...commit,
                stats: (detailedCommit as Commit).stats,
                files: (detailedCommit as Commit).files,
              };
            } catch (_err) {
              console.error(`Erro ao enriquecer commit ${commit.sha}:`, _err);
              return commit;
            }
          })
        );

        setCommits(enrichedCommits);
      } catch (err) {
        setCommitError(err instanceof Error ? err.message : 'Erro ao buscar commits');
      } finally {
        setLoadingCommits(false);
      }
    },
    [makeRequest]
  );

  // Busca dados do usuário com casts
  const fetchUser = useCallback(async () => {
    setLoadingUser(true);
    setUserError('');
    try {
      const userData = await makeRequest('https://api.github.com/user');

      const [eventsData, orgsData, starredData] = await Promise.all([
        makeRequest(`https://api.github.com/users/${(userData as User).login}/events/public?per_page=10`).catch(() => []),
        makeRequest('https://api.github.com/user/orgs').catch(() => []),
        makeRequest('https://api.github.com/user/starred?per_page=10').catch(() => []),
      ]);

      setUser({
        ...(userData as User),
        recent_events: eventsData as Event[],
        organizations: orgsData as Organization[],
        starred_repos: starredData as Repository[],
      });
    } catch (err) {
      setUserError(err instanceof Error ? err.message : 'Erro ao buscar usuário');
    } finally {
      setLoadingUser(false);
    }
  }, [makeRequest]);

  // Exemplos de fetch com casts explicitos (outros seguem padrão similar)
  const fetchBranches = useCallback(
    async (repo: string) => {
      try {
        const data = await makeRequest(`https://api.github.com/repos/${repo}/branches`);
        setBranches((data as { name: string }[]).map((b) => b.name));
      } catch (_err) {
        console.error('Erro ao buscar branches:', _err);
      }
    },
    [makeRequest]
  );

  const fetchCollaborators = useCallback(
    async (repo: string) => {
      try {
        const data = await makeRequest(`https://api.github.com/repos/${repo}/collaborators`);
        setCollaborators((data as { login: string }[]).map((c) => c.login));
      } catch (_err) {
        console.error('Erro ao buscar colaboradores:', _err);
      }
    },
    [makeRequest]
  );

  const fetchLanguages = useCallback(
    async (repo: string) => {
      try {
        const data = await makeRequest(`https://api.github.com/repos/${repo}/languages`);
        setLanguages(Object.keys(data as { [key: string]: number }));
      } catch (_err) {
        console.error('Erro ao buscar linguagens:', _err);
      }
    },
    [makeRequest]
  );

  const fetchTags = useCallback(
    async (repo: string) => {
      try {
        const data = await makeRequest(`https://api.github.com/repos/${repo}/tags`);
        setTags((data as { name: string }[]).map((t) => t.name));
      } catch (_err) {
        console.error('Erro ao buscar tags:', _err);
      }
    },
    [makeRequest]
  );

  const fetchReleases = useCallback(
    async (repo: string) => {
      try {
        const data = await makeRequest(`https://api.github.com/repos/${repo}/releases`);
        setReleases(data as unknown[]);
      } catch (_err) {
        console.error('Erro ao buscar releases:', _err);
      }
    },
    [makeRequest]
  );

  const fetchIssues = useCallback(
    async (repo: string, state: 'open' | 'closed' | 'all' = 'open') => {
      try {
        const data = await makeRequest(`https://api.github.com/repos/${repo}/issues?state=${state}&per_page=100`);
        setIssues(data as unknown[]);
      } catch (_err) {
        console.error('Erro ao buscar issues:', _err);
      }
    },
    [makeRequest]
  );

  const fetchPullRequests = useCallback(
    async (repo: string, state: 'open' | 'closed' | 'all' = 'open') => {
      try {
        const data = await makeRequest(`https://api.github.com/repos/${repo}/pulls?state=${state}&per_page=100`);
        setPullRequests(data as unknown[]);
      } catch (_err) {
        console.error('Erro ao buscar pull requests:', _err);
      }
    },
    [makeRequest]
  );

  // Funções avançadas
  const fetchCommitDetails = useCallback(
    async (repo: string, sha: string): Promise<Commit | null> => {
      try {
        const data = await makeRequest(`https://api.github.com/repos/${repo}/commits/${sha}`);
        return data as Commit;
      } catch (_err) {
        console.error('Erro ao buscar detalhes do commit:', _err);
        return null;
      }
    },
    [makeRequest]
  );

  const fetchRepositoryStats = useCallback(
    async (repo: string) => {
      try {
        const [codeFrequency, participation, punchCard] = await Promise.all([
          makeRequest(`https://api.github.com/repos/${repo}/stats/code_frequency`).catch(() => []),
          makeRequest(`https://api.github.com/repos/${repo}/stats/participation`).catch(() => ({})),
          makeRequest(`https://api.github.com/repos/${repo}/stats/punch_card`).catch(() => []),
        ]);
        return { code_frequency: codeFrequency, participation, punch_card: punchCard };
      } catch (_err) {
        console.error('Erro ao buscar estatísticas do repositório:', _err);
        return null;
      }
    },
    [makeRequest]
  );

  const fetchContributorStats = useCallback(
    async (repo: string) => {
      try {
        const data = await makeRequest(`https://api.github.com/repos/${repo}/stats/contributors`);
        return data as unknown[];
      } catch (_err) {
        console.error('Erro ao buscar estatísticas de contribuidores:', _err);
        return [];
      }
    },
    [makeRequest]
  );

  const fetchCodeFrequency = useCallback(
    async (repo: string) => {
      try {
        const data = await makeRequest(`https://api.github.com/repos/${repo}/stats/code_frequency`);
        return data as unknown[];
      } catch (_err) {
        console.error('Erro ao buscar frequência de código:', _err);
        return [];
      }
    },
    [makeRequest]
  );

  const fetchPunchCard = useCallback(
    async (repo: string) => {
      try {
        const data = await makeRequest(`https://api.github.com/repos/${repo}/stats/punch_card`);
        return data as unknown[];
      } catch (_err) {
        console.error('Erro ao buscar punch card:', _err);
        return [];
      }
    },
    [makeRequest]
  );

  // Pesquisa
  const searchRepositories = useCallback(
    async (query: string, options: SearchOptions = {}): Promise<Repository[]> => {
      try {
        const params = new URLSearchParams({
          q: query,
          sort: options.sort || 'stars',
          order: options.order || 'desc',
          per_page: (options.per_page || 30).toString(),
          page: (options.page || 1).toString(),
        });
        const data = await makeRequest(`https://api.github.com/search/repositories?${params.toString()}`);
        return (data as { items?: Repository[] }).items || [];
      } catch (_err) {
        console.error('Erro ao buscar repositórios:', _err);
        return [];
      }
    },
    [makeRequest]
  );

  // Conteúdo do repositório
  const getRepositoryContents = useCallback(
    async (repo: string, path = '', ref = 'main'): Promise<unknown[]> => {
      try {
        const params = new URLSearchParams({ ref });
        const url = `https://api.github.com/repos/${repo}/contents/${path}?${params.toString()}`;
        const data = await makeRequest(url);
        return Array.isArray(data) ? data : [data];
      } catch (_err) {
        console.error('Erro ao buscar conteúdo do repositório:', _err);
        return [];
      }
    },
    [makeRequest]
  );

  // Limpar cache
  const clearCache = useCallback(() => setCache(new Map()), []);

  // Refresh geral
  const refreshAll = useCallback(async () => {
    setLoading(true);
    clearCache();
    clearAllErrors();
    try {
      await Promise.all([fetchUser(), fetchRepositories()]);
    } catch (_err) {
      setError('Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  }, [fetchUser, fetchRepositories, clearCache, clearAllErrors]);

  // Auto limpeza do cache a cada CACHE_DURATION
  useEffect(() => {
    const interval = setInterval(() => {
      setCache((prev) => {
        const newCache = new Map<string, { data: unknown; timestamp: number }>();
        const now = Date.now();
        prev.forEach((value, key) => {
          if (now - value.timestamp < CACHE_DURATION) {
            newCache.set(key, value);
          }
        });
        return newCache;
      });
    }, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  // Atualiza loading geral
  useEffect(() => {
    setLoading(loadingRepositories || loadingCommits || loadingUser);
  }, [loadingRepositories, loadingCommits, loadingUser]);

  // Atualiza erro geral
  useEffect(() => {
    const errors = [repositoryError, commitError, userError].filter(Boolean);
    setError(errors.length > 0 ? errors[0] : '');
  }, [repositoryError, commitError, userError]);

  // Valor do contexto
  const value: GitHubContextType = {
    token,
    setToken: handleSetToken,
    repositories,
    commits,
    user,

    loading,
    loadingCommits,
    loadingRepositories,
    loadingUser,

    error,
    commitError,
    repositoryError,
    userError,

    branches,
    collaborators,
    languages,
    tags,
    releases,
    issues,
    pullRequests,

    fetchRepositories,
    fetchCommits,
    fetchUser,
    fetchBranches,
    fetchCollaborators,
    fetchLanguages,
    fetchTags,
    fetchReleases,
    fetchIssues,
    fetchPullRequests,

    fetchCommitDetails,
    fetchRepositoryStats,
    fetchContributorStats,
    fetchCodeFrequency,
    fetchPunchCard,

    clearError,
    clearAllErrors,
    searchRepositories,
    getRepositoryContents,

    clearCache,
    refreshAll,
  };

  return <GitHubContext.Provider value={value}>{children}</GitHubContext.Provider>;
};
