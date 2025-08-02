// src/context/modules/GitHubState.ts
import { useState, useCallback } from 'react';
import type {
  Repository,
  Commit,
  User,
} from '../../types/github';

interface LoadingState {
  loading: boolean;
  loadingCommits: boolean;
  loadingRepositories: boolean;
  loadingUser: boolean;
}

interface ErrorState {
  error: string;
  commitError: string;
  repositoryError: string;
  userError: string;
}

interface DataState {
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
}

export interface GitHubStateHook {
  // Data state
  data: DataState;
  
  // Loading state
  loading: LoadingState;
  
  // Error state
  errors: ErrorState;
  
  // State setters
  setRepositories: (repos: Repository[]) => void;
  setCommits: (commits: Commit[]) => void;
  setUser: (user: User | null) => void;
  setBranches: (branches: string[]) => void;
  setCollaborators: (collaborators: string[]) => void;
  setLanguages: (languages: string[]) => void;
  setTags: (tags: string[]) => void;
  setReleases: (releases: unknown[]) => void;
  setIssues: (issues: unknown[]) => void;
  setPullRequests: (pullRequests: unknown[]) => void;
  
  // Loading setters
  setLoading: (loading: boolean) => void;
  setLoadingCommits: (loading: boolean) => void;
  setLoadingRepositories: (loading: boolean) => void;
  setLoadingUser: (loading: boolean) => void;
  
  // Error setters
  setError: (error: string) => void;
  setCommitError: (error: string) => void;
  setRepositoryError: (error: string) => void;
  setUserError: (error: string) => void;
  
  // Clear functions
  clearError: () => void;
  clearAllErrors: () => void;
  clearAllData: () => void;
}

export const useGitHubState = (): GitHubStateHook => {
  // Data states
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [releases, setReleases] = useState<unknown[]>([]);
  const [issues, setIssues] = useState<unknown[]>([]);
  const [pullRequests, setPullRequests] = useState<unknown[]>([]);

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

  // Clear functions
  const clearError = useCallback(() => setError(''), []);
  
  const clearAllErrors = useCallback(() => {
    setError('');
    setCommitError('');
    setRepositoryError('');
    setUserError('');
  }, []);

  const clearAllData = useCallback(() => {
    setRepositories([]);
    setCommits([]);
    setUser(null);
    setBranches([]);
    setCollaborators([]);
    setLanguages([]);
    setTags([]);
    setReleases([]);
    setIssues([]);
    setPullRequests([]);
  }, []);

  return {
    // Data state
    data: {
      repositories,
      commits,
      user,
      branches,
      collaborators,
      languages,
      tags,
      releases,
      issues,
      pullRequests,
    },
    
    // Loading state
    loading: {
      loading,
      loadingCommits,
      loadingRepositories,
      loadingUser,
    },
    
    // Error state
    errors: {
      error,
      commitError,
      repositoryError,
      userError,
    },
    
    // State setters
    setRepositories,
    setCommits,
    setUser,
    setBranches,
    setCollaborators,
    setLanguages,
    setTags,
    setReleases,
    setIssues,
    setPullRequests,
    
    // Loading setters
    setLoading,
    setLoadingCommits,
    setLoadingRepositories,
    setLoadingUser,
    
    // Error setters
    setError,
    setCommitError,
    setRepositoryError,
    setUserError,
    
    // Clear functions
    clearError,
    clearAllErrors,
    clearAllData,
  };
};
