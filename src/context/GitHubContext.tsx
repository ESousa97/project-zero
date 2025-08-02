// src/context/GitHubContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Repository, Commit, User } from '../types/github';

interface GitHubContextType {
  token: string;
  setToken: (token: string) => void;
  repositories: Repository[];
  commits: Commit[];
  user: User | null;
  loading: boolean;
  error: string;
  fetchRepositories: () => Promise<void>;
  fetchCommits: (repo: string, branch?: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
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
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('github_token') || '';
  });
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetToken = useCallback((newToken: string) => {
    setToken(newToken);
    localStorage.setItem('github_token', newToken);
  }, []);

  const makeRequest = useCallback(async (url: string) => {
    if (!token) {
      throw new Error('Token do GitHub é obrigatório');
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }, [token]);

  const fetchRepositories = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await makeRequest('https://api.github.com/user/repos?per_page=100&sort=updated');
      setRepositories(data.sort((a: Repository, b: Repository) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [makeRequest]);

  const fetchCommits = useCallback(async (repo: string, branch = 'main') => {
    setLoading(true);
    setError('');
    
    try {
      const data = await makeRequest(`https://api.github.com/repos/${repo}/commits?sha=${branch}&per_page=100`);
      setCommits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar commits');
    } finally {
      setLoading(false);
    }
  }, [makeRequest]);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await makeRequest('https://api.github.com/user');
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuário');
    } finally {
      setLoading(false);
    }
  }, [makeRequest]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const value: GitHubContextType = {
    token,
    setToken: handleSetToken,
    repositories,
    commits,
    user,
    loading,
    error,
    fetchRepositories,
    fetchCommits,
    fetchUser,
    clearError,
  };

  return (
    <GitHubContext.Provider value={value}>
      {children}
    </GitHubContext.Provider>
  );
};
