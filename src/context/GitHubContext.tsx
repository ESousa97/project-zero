import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Repository, Commit, User } from '../types/github';

interface GitHubContextType {
  // Core data
  token: string;
  setToken: (token: string) => void;
  repositories: Repository[];
  commits: Commit[];
  user: User | null;
  
  // Loading states
  loading: boolean;
  loadingCommits: boolean;
  loadingRepositories: boolean;
  loadingUser: boolean;
  
  // Error handling
  error: string;
  commitError: string;
  repositoryError: string;
  userError: string;
  
  // Enhanced data
  branches: string[];
  collaborators: string[];
  languages: string[];
  tags: string[];
  releases: any[];
  issues: any[];
  pullRequests: any[];
  
  // API functions
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
  
  // Advanced API functions
  fetchCommitDetails: (repo: string, sha: string) => Promise<Commit | null>;
  fetchRepositoryStats: (repo: string) => Promise<any>;
  fetchContributorStats: (repo: string) => Promise<any[]>;
  fetchCodeFrequency: (repo: string) => Promise<any[]>;
  fetchPunchCard: (repo: string) => Promise<any[]>;
  
  // Utility functions
  clearError: () => void;
  clearAllErrors: () => void;
  searchRepositories: (query: string, options?: SearchOptions) => Promise<Repository[]>;
  getRepositoryContents: (repo: string, path?: string, ref?: string) => Promise<any[]>;
  
  // Cache management
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

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export const useGitHub = () => {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error('useGitHub must be used within a GitHubProvider');
  }
  return context;
};

export const GitHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core state
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('github_token') || '';
  });
  
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [user, setUser] = useState<User | null>(null);
  
  // Enhanced data state
  const [branches, setBranches] = useState<string[]>([]);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  
  // Error states
  const [error, setError] = useState('');
  const [commitError, setCommitError] = useState('');
  const [repositoryError, setRepositoryError] = useState('');
  const [userError, setUserError] = useState('');
  
  // Cache for API responses
  const [cache, setCache] = useState<Map<string, { data: any; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const handleSetToken = useCallback((newToken: string) => {
    setToken(newToken);
    localStorage.setItem('github_token', newToken);
    // Clear all data when token changes
    setRepositories([]);
    setCommits([]);
    setUser(null);
    clearAllErrors();
    setCache(new Map());
  }, []);

  // Generic request function with caching
  const makeRequest = useCallback(async (url: string, useCache = true): Promise<any> => {
    if (!token) {
      throw new Error('Token do GitHub é obrigatório');
    }

    // Check cache first
    if (useCache) {
      const cached = cache.get(url);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    
    // Cache the response
    if (useCache) {
      setCache(prev => new Map(prev.set(url, { data, timestamp: Date.now() })));
    }
    
    return data;
  }, [token, cache]);

  // Paginated request function
  const makePaginatedRequest = useCallback(async (baseUrl: string, maxPages = 10): Promise<any[]> => {
    let allData: any[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages && page <= maxPages) {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}per_page=100&page=${page}`;
      
      try {
        const data = await makeRequest(url);
        
        if (Array.isArray(data)) {
          allData = allData.concat(data);
          hasMorePages = data.length === 100; // GitHub returns 100 items per page when there are more
        } else {
          hasMorePages = false;
        }
        
        page++;
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        hasMorePages = false;
      }
    }

    return allData;
  }, [makeRequest]);

  // Core API functions
  const fetchRepositories = useCallback(async () => {
    setLoadingRepositories(true);
    setRepositoryError('');
    
    try {
      const data = await makePaginatedRequest('https://api.github.com/user/repos?sort=updated');
      
      // Enrich repositories with additional data
      const enrichedRepos = await Promise.all(
        data.slice(0, 50).map(async (repo: Repository) => { // Limit to 50 for performance
          try {
            const [languagesData, contributorsData] = await Promise.all([
              makeRequest(`https://api.github.com/repos/${repo.full_name}/languages`).catch(() => ({})),
              makeRequest(`https://api.github.com/repos/${repo.full_name}/contributors?per_page=10`).catch(() => [])
            ]);
            
            return {
              ...repo,
              languages_data: languagesData,
              contributors_data: contributorsData,
              contributor_count: contributorsData.length
            };
          } catch (error) {
            console.error(`Error enriching repo ${repo.name}:`, error);
            return repo;
          }
        })
      );
      
      setRepositories(enrichedRepos.sort((a: Repository, b: Repository) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ));
    } catch (err) {
      setRepositoryError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoadingRepositories(false);
    }
  }, [makePaginatedRequest, makeRequest]);

  const fetchCommits = useCallback(async (
    repo: string, 
    branch = 'main', 
    options: CommitFetchOptions = {}
  ) => {
    setLoadingCommits(true);
    setCommitError('');
    
    try {
      const params = new URLSearchParams({
        sha: branch,
        per_page: (options.per_page || 100).toString(),
        page: (options.page || 1).toString()
      });
      
      if (options.since) params.append('since', options.since);
      if (options.until) params.append('until', options.until);
      if (options.author) params.append('author', options.author);
      if (options.path) params.append('path', options.path);
      
      const url = `https://api.github.com/repos/${repo}/commits?${params.toString()}`;
      const data = await makeRequest(url);
      
      // Enrich commits with detailed stats
      const enrichedCommits = await Promise.all(
        data.slice(0, 50).map(async (commit: Commit) => {
          try {
            const detailedCommit = await makeRequest(`https://api.github.com/repos/${repo}/commits/${commit.sha}`);
            return {
              ...commit,
              stats: detailedCommit.stats,
              files: detailedCommit.files
            };
          } catch (error) {
            console.error(`Error enriching commit ${commit.sha}:`, error);
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
  }, [makeRequest]);

  const fetchUser = useCallback(async () => {
    setLoadingUser(true);
    setUserError('');
    
    try {
      const userData = await makeRequest('https://api.github.com/user');
      
      // Fetch additional user data
      const [eventsData, orgsData, starredData] = await Promise.all([
        makeRequest(`https://api.github.com/users/${userData.login}/events/public?per_page=10`).catch(() => []),
        makeRequest('https://api.github.com/user/orgs').catch(() => []),
        makeRequest('https://api.github.com/user/starred?per_page=10').catch(() => [])
      ]);
      
      setUser({
        ...userData,
        recent_events: eventsData,
        organizations: orgsData,
        starred_repos: starredData
      });
    } catch (err) {
      setUserError(err instanceof Error ? err.message : 'Erro ao buscar usuário');
    } finally {
      setLoadingUser(false);
    }
  }, [makeRequest]);

  // Enhanced API functions
  const fetchBranches = useCallback(async (repo: string) => {
    try {
      const data = await makeRequest(`https://api.github.com/repos/${repo}/branches`);
      setBranches(data.map((branch: any) => branch.name));
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  }, [makeRequest]);

  const fetchCollaborators = useCallback(async (repo: string) => {
    try {
      const data = await makeRequest(`https://api.github.com/repos/${repo}/collaborators`);
      setCollaborators(data.map((collaborator: any) => collaborator.login));
    } catch (err) {
      console.error('Error fetching collaborators:', err);
    }
  }, [makeRequest]);

  const fetchLanguages = useCallback(async (repo: string) => {
    try {
      const data = await makeRequest(`https://api.github.com/repos/${repo}/languages`);
      setLanguages(Object.keys(data));
    } catch (err) {
      console.error('Error fetching languages:', err);
    }
  }, [makeRequest]);

  const fetchTags = useCallback(async (repo: string) => {
    try {
      const data = await makeRequest(`https://api.github.com/repos/${repo}/tags`);
      setTags(data.map((tag: any) => tag.name));
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  }, [makeRequest]);

  const fetchReleases = useCallback(async (repo: string) => {
    try {
      const data = await makeRequest(`https://api.github.com/repos/${repo}/releases`);
      setReleases(data);
    } catch (err) {
      console.error('Error fetching releases:', err);
    }
  }, [makeRequest]);

  const fetchIssues = useCallback(async (repo: string, state: 'open' | 'closed' | 'all' = 'open') => {
    try {
      const data = await makeRequest(`https://api.github.com/repos/${repo}/issues?state=${state}&per_page=100`);
      setIssues(data);
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  }, [makeRequest]);

  const fetchPullRequests = useCallback(async (repo: string, state: 'open' | 'closed' | 'all' = 'open') => {
    try {
      const data = await makeRequest(`https://api.github.com/repos/${repo}/pulls?state=${state}&per_page=100`);
      setPullRequests(data);
    } catch (err) {
      console.error('Error fetching pull requests:', err);
    }
  }, [makeRequest]);

  // Advanced API functions
  const fetchCommitDetails = useCallback(async (repo: string, sha: string): Promise<Commit | null> => {
    try {
      const data = await makeRequest(`https://api.github.com/repos/${repo}/commits/${sha}`);
      return data;
    } catch (err) {
      console.error('Error fetching commit details:', err);
      return null;
    }
  }, [makeRequest]);

  const fetchRepositoryStats = useCallback(async (repo: string) => {
    try {
      const [codeFrequency, participation, punchCard] = await Promise.all([
        makeRequest(`https://api.github.com/repos/${repo}/stats/code_frequency`).catch(() => []),
        makeRequest(`https://api.github.com/repos/${repo}/stats/participation`).catch(() => {}),
        makeRequest(`https://api.github.com/repos/${repo}/stats/punch_card`).catch(() => [])
      ]);
      
      return {
        code_frequency: codeFrequency,
        participation,
        punch_card: punchCard
      };
    } catch (err) {
      console.error('Error fetching repository stats:', err);
      return null;
    }
  }, [makeRequest]);

  const fetchContributorStats = useCallback(async (repo: string) => {
    try {
      const data = await makeRequest(`https://api.github.com/repos/${repo}/stats/contributors`);
      return data || [];
    } catch (err) {
      console.error('Error fetching contributor stats:', err);
      return [];
    }
  }, [makeRequest]);

  const fetchCodeFrequency = useCallback(async (repo: string) => {
    try {
      const data = await makeRequest(`https://api.github.com/repos/${repo}/stats/code_frequency`);
      return data || [];
    } catch (err) {
      console.error('Error fetching code frequency:', err);
      return [];
    }
  }, [makeRequest]);

  const fetchPunchCard = useCallback(async (repo: string) => {
    try {
      const data = await makeRequest(`https://api.github.com/repos/${repo}/stats/punch_card`);
      return data || [];
    } catch (err) {
      console.error('Error fetching punch card:', err);
      return [];
    }
  }, [makeRequest]);

  // Search function
  const searchRepositories = useCallback(async (
    query: string, 
    options: SearchOptions = {}
  ): Promise<Repository[]> => {
    try {
      const params = new URLSearchParams({
        q: query,
        sort: options.sort || 'stars',
        order: options.order || 'desc',
        per_page: (options.per_page || 30).toString(),
        page: (options.page || 1).toString()
      });
      
      const data = await makeRequest(`https://api.github.com/search/repositories?${params.toString()}`);
      return data.items || [];
    } catch (err) {
      console.error('Error searching repositories:', err);
      return [];
    }
  }, [makeRequest]);

  // Get repository contents
  const getRepositoryContents = useCallback(async (
    repo: string, 
    path = '', 
    ref = 'main'
  ) => {
    try {
      const params = new URLSearchParams({ ref });
      const url = `https://api.github.com/repos/${repo}/contents/${path}?${params.toString()}`;
      const data = await makeRequest(url);
      return Array.isArray(data) ? data : [data];
    } catch (err) {
      console.error('Error fetching repository contents:', err);
      return [];
    }
  }, [makeRequest]);

  // Utility functions
  const clearError = useCallback(() => {
    setError('');
  }, []);

  const clearAllErrors = useCallback(() => {
    setError('');
    setCommitError('');
    setRepositoryError('');
    setUserError('');
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    clearCache();
    clearAllErrors();
    
    try {
      await Promise.all([
        fetchUser(),
        fetchRepositories()
      ]);
    } catch (err) {
      setError('Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  }, [fetchUser, fetchRepositories, clearCache, clearAllErrors]);

  // Auto-cleanup cache
  useEffect(() => {
    const interval = setInterval(() => {
      setCache(prev => {
        const newCache = new Map();
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

  // Set loading state when any specific loading is active
  useEffect(() => {
    setLoading(loadingRepositories || loadingCommits || loadingUser);
  }, [loadingRepositories, loadingCommits, loadingUser]);

  // Set main error when any specific error occurs
  useEffect(() => {
    const errors = [repositoryError, commitError, userError].filter(Boolean);
    if (errors.length > 0) {
      setError(errors[0]);
    } else {
      setError('');
    }
  }, [repositoryError, commitError, userError]);

  const value: GitHubContextType = {
    // Core data
    token,
    setToken: handleSetToken,
    repositories,
    commits,
    user,
    
    // Loading states
    loading,
    loadingCommits,
    loadingRepositories,
    loadingUser,
    
    // Error handling
    error,
    commitError,
    repositoryError,
    userError,
    
    // Enhanced data
    branches,
    collaborators,
    languages,
    tags,
    releases,
    issues,
    pullRequests,
    
    // API functions
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
    
    // Advanced API functions
    fetchCommitDetails,
    fetchRepositoryStats,
    fetchContributorStats,
    fetchCodeFrequency,
    fetchPunchCard,
    
    // Utility functions
    clearError,
    clearAllErrors,
    searchRepositories,
    getRepositoryContents,
    
    // Cache management
    clearCache,
    refreshAll
  };

  return (
    <GitHubContext.Provider value={value}>
      {children}
    </GitHubContext.Provider>
  );
};
