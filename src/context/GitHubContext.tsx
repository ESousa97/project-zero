import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { GitHubAPI } from './modules/GitHubAPI';
import { useGitHubState } from './modules/GitHubState';
import { GitHubServices } from './modules/GitHubServices';
import type { Repository, Commit, User } from '../types/github';

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

interface GitHubContextType {
  token: string;
  setToken: (token: string) => void;
  repositories: Repository[];
  commits: Commit[];
  user: User | null;
  branches: string[];
  collaborators: string[];
  languages: string[];
  tags: string[];
  releases: unknown[];
  issues: unknown[];
  pullRequests: unknown[];
  loading: boolean;
  loadingCommits: boolean;
  loadingRepositories: boolean;
  loadingUser: boolean;
  error: string;
  commitError: string;
  repositoryError: string;
  userError: string;
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
  searchRepositories: (query: string, options?: SearchOptions) => Promise<Repository[]>;
  getRepositoryContents: (repo: string, path?: string, ref?: string) => Promise<unknown[]>;
  clearError: () => void;
  clearAllErrors: () => void;
  clearCache: () => void;
  refreshAll: () => Promise<void>;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export const useGitHub = (): GitHubContextType => {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error('useGitHub must be used within a GitHubProvider');
  }
  return context;
};

const GITHUB_API_BASE = 'https://api.github.com';

// Função helper para verificar se localStorage está disponível
const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

// Função helper para obter token de forma segura
const getStoredToken = (): string => {
  if (!isLocalStorageAvailable()) {
    return '';
  }
  
  try {
    return localStorage.getItem('github_token') || '';
  } catch (_error) {
    return '';
  }
};

// Função helper para salvar token de forma segura
const setStoredToken = (token: string): void => {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  try {
    if (token) {
      localStorage.setItem('github_token', token);
    } else {
      localStorage.removeItem('github_token');
    }
  } catch (_error) {
    // Silently fail
  }
};

export const GitHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Token state com inicialização segura
  const [token, setTokenState] = useState<string>(() => getStoredToken());

  // Refs para evitar loops
  const initializationRef = useRef(false);
  const isLoadingRef = useRef(false);

  // State hook modularizado
  const state = useGitHubState();

  // API instance - criada apenas quando token existe e é válido
  const api = useMemo(() => {
    if (!token || token.length < 10) {
      return null;
    }
    return new GitHubAPI(token);
  }, [token]);

  // Services instance
  const services = useMemo(() => {
    if (!api) return null;
    return new GitHubServices(api, state);
  }, [api, state]);

  // Token setter com validação
  const setToken = useCallback((newToken: string) => {
    // Validação básica do token
    if (newToken && !newToken.startsWith('ghp_') && !newToken.startsWith('github_pat_')) {
      state.setError('Token inválido. Verifique se é um Personal Access Token válido.');
      return;
    }
    
    setTokenState(newToken);
    setStoredToken(newToken);
    
    if (services) {
      services.updateToken(newToken);
    } else {
      state.clearAllData();
      state.clearAllErrors();
    }
    
    // Reset initialization
    initializationRef.current = false;
  }, [services, state]);

  // Wrapper methods com melhor tratamento de erro
  const fetchRepositories = useCallback(async () => {
    if (!services) {
      const errorMsg = 'Token do GitHub é obrigatório para buscar repositórios';
      state.setRepositoryError(errorMsg);
      throw new Error(errorMsg);
    }
    return services.fetchRepositories();
  }, [services, state]);

  const fetchCommits = useCallback(async (repoFullName: string, branch: string = 'main') => {
    if (!token || isLoadingRef.current) {
      return;
    }

    // Validação do token antes da requisição
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      state.setCommitError('Token do GitHub inválido');
      return;
    }

    try {
      isLoadingRef.current = true;
      state.setLoadingCommits(true);
      
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${repoFullName}/commits?sha=${branch}&per_page=100`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitVision-Pro/1.0',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          const errorMsg = 'Token do GitHub inválido ou expirado. Verifique suas credenciais.';
          state.setCommitError(errorMsg);
          state.setError(errorMsg);
          return;
        }
        
        if (response.status === 404) {
          return;
        }
        
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const commitsData = await response.json();
      state.setCommits(commitsData);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao buscar commits';
      state.setCommitError(errorMessage);
    } finally {
      state.setLoadingCommits(false);
      isLoadingRef.current = false;
    }
  }, [token, state]);

  const fetchUser = useCallback(async () => {
    if (!services) {
      const errorMsg = 'Token do GitHub é obrigatório para buscar usuário';
      state.setUserError(errorMsg);
      throw new Error(errorMsg);
    }
    return services.fetchUser();
  }, [services, state]);

  const fetchBranches = useCallback(async (repo: string) => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchBranches(repo);
  }, [services]);

  const fetchCollaborators = useCallback(async (repo: string) => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchCollaborators(repo);
  }, [services]);

  const fetchLanguages = useCallback(async (repo: string) => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchLanguages(repo);
  }, [services]);

  const fetchTags = useCallback(async (repo: string) => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchTags(repo);
  }, [services]);

  const fetchReleases = useCallback(async (repo: string) => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchReleases(repo);
  }, [services]);

  const fetchIssues = useCallback(async (repo: string, issueState: 'open' | 'closed' | 'all' = 'open') => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchIssues(repo, issueState);
  }, [services]);

  const fetchPullRequests = useCallback(async (repo: string, prState: 'open' | 'closed' | 'all' = 'open') => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchPullRequests(repo, prState);
  }, [services]);

  const fetchCommitDetails = useCallback(async (repo: string, sha: string) => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchCommitDetails(repo, sha);
  }, [services]);

  const fetchRepositoryStats = useCallback(async (repo: string) => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchRepositoryStats(repo);
  }, [services]);

  const fetchContributorStats = useCallback(async (repo: string) => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchContributorStats(repo);
  }, [services]);

  const fetchCodeFrequency = useCallback(async (repo: string) => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchCodeFrequency(repo);
  }, [services]);

  const fetchPunchCard = useCallback(async (repo: string) => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchPunchCard(repo);
  }, [services]);

  const searchRepositories = useCallback(async (query: string, options: SearchOptions = {}) => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.searchRepositories(query, options);
  }, [services]);

  const getRepositoryContents = useCallback(async (repo: string, path = '', ref = 'main') => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.getRepositoryContents(repo, path, ref);
  }, [services]);

  const refreshAll = useCallback(async () => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.refreshAll();
  }, [services]);

  const clearCache = useCallback(() => {
    if (services) {
      services.clearCache();
    }
  }, [services]);

  // AUTO-LOAD EFFECT com melhor logging
  useEffect(() => {
    const initializeData = async () => {
      if (
        token && 
        services && 
        !initializationRef.current && 
        !state.data.user && 
        !state.loading.loadingUser
      ) {
        try {
          initializationRef.current = true;
          
          await Promise.all([
            services.fetchUser(),
            services.fetchRepositories()
          ]);
          
        } catch (error) {
          initializationRef.current = false; // Reset on error
          
          // Tratamento específico para erro 401
          if (error instanceof Error && error.message.includes('401')) {
            state.setError('Token do GitHub inválido ou expirado. Por favor, configure um novo token.');
          }
        }
      }
    };

    initializeData();
  }, [token, services, state.data.user, state.loading.loadingUser, state]);

  // Auto-limpeza de cache
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.cleanExpiredCache();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [api]);

  // Context value
  const value: GitHubContextType = {
    token,
    setToken,
    repositories: state.data.repositories,
    commits: state.data.commits,
    user: state.data.user,
    branches: state.data.branches,
    collaborators: state.data.collaborators,
    languages: state.data.languages,
    tags: state.data.tags,
    releases: state.data.releases,
    issues: state.data.issues,
    pullRequests: state.data.pullRequests,
    loading: state.loading.loading,
    loadingCommits: state.loading.loadingCommits,
    loadingRepositories: state.loading.loadingRepositories,
    loadingUser: state.loading.loadingUser,
    error: state.errors.error,
    commitError: state.errors.commitError,
    repositoryError: state.errors.repositoryError,
    userError: state.errors.userError,
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
    searchRepositories,
    getRepositoryContents,
    clearError: state.clearError,
    clearAllErrors: state.clearAllErrors,
    clearCache,
    refreshAll,
  };

  return (
    <GitHubContext.Provider value={value}>
      {children}
    </GitHubContext.Provider>
  );
};
