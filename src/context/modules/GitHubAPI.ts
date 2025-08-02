// src/context/modules/GitHubAPI.ts
import type {
  Repository,
  Commit,
  User,
  Event,
  Organization,
  Contributor,
} from '../../types/github';

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

export class GitHubAPI {
  private token: string;
  private cache: Map<string, { data: unknown; timestamp: number }>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor(token: string) {
    this.token = token;
    this.cache = new Map();
  }

  updateToken(newToken: string): void {
    this.token = newToken;
    this.clearCache();
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Método privado para requisições genéricas com cache
  private async makeRequest(url: string, useCache = true): Promise<unknown> {
    if (!this.token) {
      throw new Error('Token do GitHub é obrigatório');
    }

    if (useCache) {
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();

    if (useCache) {
      this.cache.set(url, { data, timestamp: Date.now() });
    }

    return data;
  }

  // Método privado para requisições paginadas
  private async makePaginatedRequest(baseUrl: string, maxPages = 20): Promise<unknown[]> {
    let allData: unknown[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages && page <= maxPages) {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}per_page=100&page=${page}`;

      try {
        const data = await this.makeRequest(url);
        if (Array.isArray(data)) {
          allData = allData.concat(data);
          hasMorePages = data.length === 100;
        } else {
          hasMorePages = false;
        }
        page++;
      } catch (err) {
        console.error(`Erro ao buscar página ${page}:`, err);
        hasMorePages = false;
      }
    }
    return allData;
  }

  // Métodos públicos para buscar dados
  async fetchRepositories(): Promise<Repository[]> {
    const data = await this.makePaginatedRequest('https://api.github.com/user/repos?sort=updated');
    return data as Repository[];
  }

  async fetchRepositoryLanguages(repoFullName: string): Promise<{ [key: string]: number }> {
    try {
      const data = await this.makeRequest(`https://api.github.com/repos/${repoFullName}/languages`);
      return data as { [key: string]: number };
    } catch {
      return {};
    }
  }

  async fetchRepositoryContributors(repoFullName: string): Promise<Contributor[]> {
    try {
      const data = await this.makeRequest(`https://api.github.com/repos/${repoFullName}/contributors?per_page=10`);
      return data as Contributor[];
    } catch {
      return [];
    }
  }

  async fetchCommits(repo: string, branch = 'main', options: CommitFetchOptions = {}): Promise<Commit[]> {
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
    const data = await this.makeRequest(url);
    return data as Commit[];
  }

  async fetchCommitDetails(repo: string, sha: string): Promise<Commit> {
    const data = await this.makeRequest(`https://api.github.com/repos/${repo}/commits/${sha}`);
    return data as Commit;
  }

  async fetchUser(): Promise<User> {
    const data = await this.makeRequest('https://api.github.com/user');
    return data as User;
  }

  async fetchUserEvents(login: string): Promise<Event[]> {
    try {
      const data = await this.makeRequest(`https://api.github.com/users/${login}/events/public?per_page=10`);
      return data as Event[];
    } catch {
      return [];
    }
  }

  async fetchUserOrganizations(): Promise<Organization[]> {
    try {
      const data = await this.makeRequest('https://api.github.com/user/orgs');
      return data as Organization[];
    } catch {
      return [];
    }
  }

  async fetchUserStarred(): Promise<Repository[]> {
    try {
      const data = await this.makeRequest('https://api.github.com/user/starred?per_page=10');
      return data as Repository[];
    } catch {
      return [];
    }
  }

  async fetchBranches(repo: string): Promise<string[]> {
    try {
      const data = await this.makeRequest(`https://api.github.com/repos/${repo}/branches`);
      return (data as { name: string }[]).map(b => b.name);
    } catch {
      return [];
    }
  }

  async fetchCollaborators(repo: string): Promise<string[]> {
    try {
      const data = await this.makeRequest(`https://api.github.com/repos/${repo}/collaborators`);
      return (data as { login: string }[]).map(c => c.login);
    } catch {
      return [];
    }
  }

  async fetchLanguages(repo: string): Promise<string[]> {
    try {
      const data = await this.makeRequest(`https://api.github.com/repos/${repo}/languages`);
      return Object.keys(data as { [key: string]: number });
    } catch {
      return [];
    }
  }

  async fetchTags(repo: string): Promise<string[]> {
    try {
      const data = await this.makeRequest(`https://api.github.com/repos/${repo}/tags`);
      return (data as { name: string }[]).map(t => t.name);
    } catch {
      return [];
    }
  }

  async fetchReleases(repo: string): Promise<unknown[]> {
    try {
      const data = await this.makeRequest(`https://api.github.com/repos/${repo}/releases`);
      return data as unknown[];
    } catch {
      return [];
    }
  }

  async fetchIssues(repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<unknown[]> {
    try {
      const data = await this.makeRequest(`https://api.github.com/repos/${repo}/issues?state=${state}&per_page=100`);
      return data as unknown[];
    } catch {
      return [];
    }
  }

  async fetchPullRequests(repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<unknown[]> {
    try {
      const data = await this.makeRequest(`https://api.github.com/repos/${repo}/pulls?state=${state}&per_page=100`);
      return data as unknown[];
    } catch {
      return [];
    }
  }

  async fetchRepositoryStats(repo: string): Promise<unknown | null> {
    try {
      const [codeFrequency, participation, punchCard] = await Promise.all([
        this.makeRequest(`https://api.github.com/repos/${repo}/stats/code_frequency`).catch(() => []),
        this.makeRequest(`https://api.github.com/repos/${repo}/stats/participation`).catch(() => ({})),
        this.makeRequest(`https://api.github.com/repos/${repo}/stats/punch_card`).catch(() => []),
      ]);
      return { code_frequency: codeFrequency, participation, punch_card: punchCard };
    } catch {
      return null;
    }
  }

  async fetchContributorStats(repo: string): Promise<unknown[]> {
    try {
      const data = await this.makeRequest(`https://api.github.com/repos/${repo}/stats/contributors`);
      return data as unknown[];
    } catch {
      return [];
    }
  }

  async fetchCodeFrequency(repo: string): Promise<unknown[]> {
    try {
      const data = await this.makeRequest(`https://api.github.com/repos/${repo}/stats/code_frequency`);
      return data as unknown[];
    } catch {
      return [];
    }
  }

  async fetchPunchCard(repo: string): Promise<unknown[]> {
    try {
      const data = await this.makeRequest(`https://api.github.com/repos/${repo}/stats/punch_card`);
      return data as unknown[];
    } catch {
      return [];
    }
  }

  async searchRepositories(query: string, options: SearchOptions = {}): Promise<Repository[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        sort: options.sort || 'stars',
        order: options.order || 'desc',
        per_page: (options.per_page || 30).toString(),
        page: (options.page || 1).toString(),
      });
      const data = await this.makeRequest(`https://api.github.com/search/repositories?${params.toString()}`);
      return (data as { items?: Repository[] }).items || [];
    } catch {
      return [];
    }
  }

  async getRepositoryContents(repo: string, path = '', ref = 'main'): Promise<unknown[]> {
    try {
      const params = new URLSearchParams({ ref });
      const url = `https://api.github.com/repos/${repo}/contents/${path}?${params.toString()}`;
      const data = await this.makeRequest(url);
      return Array.isArray(data) ? data : [data];
    } catch {
      return [];
    }
  }

  // Método para limpar cache automaticamente
  cleanExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.cache.forEach((value, key) => {
      if (now - value.timestamp >= this.CACHE_DURATION) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.cache.delete(key));
  }
}
