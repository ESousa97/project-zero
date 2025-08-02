// src/context/modules/GitHubServices.ts
import { GitHubAPI } from './GitHubAPI';
import type { GitHubStateHook } from './GitHubState';
import type { Repository, Commit, User, Contributor } from '../../types/github';

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

export class GitHubServices {
  private api: GitHubAPI;
  private state: GitHubStateHook;

  constructor(api: GitHubAPI, state: GitHubStateHook) {
    this.api = api;
    this.state = state;
  }

  async fetchRepositories(): Promise<void> {
    this.state.setLoadingRepositories(true);
    this.state.setRepositoryError('');
    
    try {
      const repositories = await this.api.fetchRepositories();
      
      // Enriquece os repositórios com dados adicionais
      const enrichedRepos = await Promise.all(
        repositories.map(async (repo) => {
          try {
            const [languagesData, contributorsData] = await Promise.all([
              this.api.fetchRepositoryLanguages(repo.full_name),
              this.api.fetchRepositoryContributors(repo.full_name),
            ]);
            
            return {
              ...repo,
              languages_data: languagesData,
              contributors_data: contributorsData as Contributor[],
              contributor_count: contributorsData.length,
            } as Repository;
          } catch (_err) {
            console.error(`Erro ao enriquecer repo ${repo.name}:`, _err);
            return repo;
          }
        })
      );

      // Ordena por data de atualização
      const sortedRepos = enrichedRepos.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      this.state.setRepositories(sortedRepos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      this.state.setRepositoryError(errorMessage);
    } finally {
      this.state.setLoadingRepositories(false);
    }
  }

  async fetchCommits(repo: string, branch = 'main', options: CommitFetchOptions = {}): Promise<void> {
    this.state.setLoadingCommits(true);
    this.state.setCommitError('');
    
    try {
      const commits = await this.api.fetchCommits(repo, branch, options);
      
      // Enriquece os commits com detalhes adicionais
      const enrichedCommits = await Promise.all(
        commits.map(async (commit) => {
          try {
            const detailedCommit = await this.api.fetchCommitDetails(repo, commit.sha);
            return {
              ...commit,
              stats: detailedCommit.stats,
              files: detailedCommit.files,
            };
          } catch (_err) {
            console.error(`Erro ao enriquecer commit ${commit.sha}:`, _err);
            return commit;
          }
        })
      );

      this.state.setCommits(enrichedCommits);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar commits';
      this.state.setCommitError(errorMessage);
    } finally {
      this.state.setLoadingCommits(false);
    }
  }

  async fetchUser(): Promise<void> {
    this.state.setLoadingUser(true);
    this.state.setUserError('');
    
    try {
      const user = await this.api.fetchUser();
      
      // Enriquece o usuário com dados adicionais
      const [eventsData, orgsData, starredData] = await Promise.all([
        this.api.fetchUserEvents(user.login),
        this.api.fetchUserOrganizations(),
        this.api.fetchUserStarred(),
      ]);

      const enrichedUser: User = {
        ...user,
        recent_events: eventsData,
        organizations: orgsData,
        starred_repos: starredData,
      };

      this.state.setUser(enrichedUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar usuário';
      this.state.setUserError(errorMessage);
    } finally {
      this.state.setLoadingUser(false);
    }
  }

  async fetchBranches(repo: string): Promise<void> {
    try {
      const branches = await this.api.fetchBranches(repo);
      this.state.setBranches(branches);
    } catch (_err) {
      console.error('Erro ao buscar branches:', _err);
    }
  }

  async fetchCollaborators(repo: string): Promise<void> {
    try {
      const collaborators = await this.api.fetchCollaborators(repo);
      this.state.setCollaborators(collaborators);
    } catch (_err) {
      console.error('Erro ao buscar colaboradores:', _err);
    }
  }

  async fetchLanguages(repo: string): Promise<void> {
    try {
      const languages = await this.api.fetchLanguages(repo);
      this.state.setLanguages(languages);
    } catch (_err) {
      console.error('Erro ao buscar linguagens:', _err);
    }
  }

  async fetchTags(repo: string): Promise<void> {
    try {
      const tags = await this.api.fetchTags(repo);
      this.state.setTags(tags);
    } catch (_err) {
      console.error('Erro ao buscar tags:', _err);
    }
  }

  async fetchReleases(repo: string): Promise<void> {
    try {
      const releases = await this.api.fetchReleases(repo);
      this.state.setReleases(releases);
    } catch (_err) {
      console.error('Erro ao buscar releases:', _err);
    }
  }

  async fetchIssues(repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<void> {
    try {
      const issues = await this.api.fetchIssues(repo, state);
      this.state.setIssues(issues);
    } catch (_err) {
      console.error('Erro ao buscar issues:', _err);
    }
  }

  async fetchPullRequests(repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<void> {
    try {
      const pullRequests = await this.api.fetchPullRequests(repo, state);
      this.state.setPullRequests(pullRequests);
    } catch (_err) {
      console.error('Erro ao buscar pull requests:', _err);
    }
  }

  async fetchCommitDetails(repo: string, sha: string): Promise<Commit | null> {
    try {
      return await this.api.fetchCommitDetails(repo, sha);
    } catch (_err) {
      console.error('Erro ao buscar detalhes do commit:', _err);
      return null;
    }
  }

  async fetchRepositoryStats(repo: string): Promise<unknown | null> {
    try {
      return await this.api.fetchRepositoryStats(repo);
    } catch (_err) {
      console.error('Erro ao buscar estatísticas do repositório:', _err);
      return null;
    }
  }

  async fetchContributorStats(repo: string): Promise<unknown[]> {
    try {
      return await this.api.fetchContributorStats(repo);
    } catch (_err) {
      console.error('Erro ao buscar estatísticas de contribuidores:', _err);
      return [];
    }
  }

  async fetchCodeFrequency(repo: string): Promise<unknown[]> {
    try {
      return await this.api.fetchCodeFrequency(repo);
    } catch (_err) {
      console.error('Erro ao buscar frequência de código:', _err);
      return [];
    }
  }

  async fetchPunchCard(repo: string): Promise<unknown[]> {
    try {
      return await this.api.fetchPunchCard(repo);
    } catch (_err) {
      console.error('Erro ao buscar punch card:', _err);
      return [];
    }
  }

  async searchRepositories(query: string, options: SearchOptions = {}): Promise<Repository[]> {
    try {
      return await this.api.searchRepositories(query, options);
    } catch (_err) {
      console.error('Erro ao buscar repositórios:', _err);
      return [];
    }
  }

  async getRepositoryContents(repo: string, path = '', ref = 'main'): Promise<unknown[]> {
    try {
      return await this.api.getRepositoryContents(repo, path, ref);
    } catch (_err) {
      console.error('Erro ao buscar conteúdo do repositório:', _err);
      return [];
    }
  }

  async refreshAll(): Promise<void> {
    this.state.setLoading(true);
    this.api.clearCache();
    this.state.clearAllErrors();
    
    try {
      await Promise.all([
        this.fetchUser(),
        this.fetchRepositories(),
      ]);
    } catch (_err) {
      this.state.setError('Erro ao atualizar dados');
    } finally {
      this.state.setLoading(false);
    }
  }

  clearCache(): void {
    this.api.clearCache();
  }

  updateToken(newToken: string): void {
    this.api.updateToken(newToken);
    this.state.clearAllData();
    this.state.clearAllErrors();
  }
}
