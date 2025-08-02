// src/context/GitHubContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { GitHubAPI } from './modules/GitHubAPI';
import { useGitHubState } from './modules/GitHubState';
import { GitHubServices } from './modules/GitHubServices';
import type {
  Repository,
  Commit,
  User,
} from '../types/github';

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
  // Token management
  token: string;
  setToken: (token: string) => void;

  // Data
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

  // Loading states
  loading: boolean;
  loadingCommits: boolean;
  loadingRepositories: boolean;
  loadingUser: boolean;

  // Error states
  error: string;
  commitError: string;
  repositoryError: string;
  userError: string;

  // Service methods
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

  // Advanced methods
  fetchCommitDetails: (repo: string, sha: string) => Promise<Commit | null>;
  fetchRepositoryStats: (repo: string) => Promise<unknown | null>;
  fetchContributorStats: (repo: string) => Promise<unknown[]>;
  fetchCodeFrequency: (repo: string) => Promise<unknown[]>;
  fetchPunchCard: (repo: string) => Promise<unknown[]>;

  // Search and utility methods
  searchRepositories: (query: string, options?: SearchOptions) => Promise<Repository[]>;
  getRepositoryContents: (repo: string, path?: string, ref?: string) => Promise<unknown[]>;

  // Management methods
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

export const GitHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Token state
  const [token, setTokenState] = useState<string>(() => 
    localStorage.getItem('github_token') || ''
  );

  // State hook modularizado
  const state = useGitHubState();

  // API instance - criada apenas quando token existe
  const api = useMemo(() => {
    if (!token) return null;
    return new GitHubAPI(token);
  }, [token]);

  // Services instance - criada apenas quando API e state existem
  const services = useMemo(() => {
    if (!api) return null;
    return new GitHubServices(api, state);
  }, [api, state]);

  // Token setter que limpa dados e atualiza localStorage
  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken);
    localStorage.setItem('github_token', newToken);
    
    if (services) {
      services.updateToken(newToken);
    } else {
      // Se não temos services ainda, limpa dados diretamente
      state.clearAllData();
      state.clearAllErrors();
    }
  }, [services, state]);

  // Wrapper methods para o services com fallback
  const fetchRepositories = useCallback(async () => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchRepositories();
  }, [services]);

  const fetchCommits = useCallback(async (repo: string, branch = 'main', options: CommitFetchOptions = {}) => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchCommits(repo, branch, options);
  }, [services]);

  const fetchUser = useCallback(async () => {
    if (!services) throw new Error('Token do GitHub é obrigatório');
    return services.fetchUser();
  }, [services]);

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

  // Atualização automática de loading geral
  useEffect(() => {
    const isLoading = state.loading.loadingRepositories || 
                     state.loading.loadingCommits || 
                     state.loading.loadingUser;
    state.setLoading(isLoading);
  }, [state.loading.loadingRepositories, state.loading.loadingCommits, state.loading.loadingUser, state]);

  // Atualização automática de erro geral
  useEffect(() => {
    const errors = [
      state.errors.repositoryError, 
      state.errors.commitError, 
      state.errors.userError
    ].filter(Boolean);
    
    state.setError(errors.length > 0 ? errors[0] : '');
  }, [state.errors.repositoryError, state.errors.commitError, state.errors.userError, state]);

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
    // Token management
    token,
    setToken,

    // Data from state
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

    // Loading states
    loading: state.loading.loading,
    loadingCommits: state.loading.loadingCommits,
    loadingRepositories: state.loading.loadingRepositories,
    loadingUser: state.loading.loadingUser,

    // Error states
    error: state.errors.error,
    commitError: state.errors.commitError,
    repositoryError: state.errors.repositoryError,
    userError: state.errors.userError,

    // Service methods
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

    // Advanced methods
    fetchCommitDetails,
    fetchRepositoryStats,
    fetchContributorStats,
    fetchCodeFrequency,
    fetchPunchCard,

    // Search and utility methods
    searchRepositories,
    getRepositoryContents,

    // Management methods
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
