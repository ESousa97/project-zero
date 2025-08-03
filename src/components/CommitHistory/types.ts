// src/components/CommitHistory/types.ts - Arquivo Separado
export type TimeFilter = 'all' | 'hour' | 'day' | 'week' | 'month' | 'year';
export type SortBy = 'date' | 'author' | 'additions' | 'deletions' | 'changes';
export type ViewMode = 'list' | 'timeline' | 'analytics';
export type CommitType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | 'other';

export interface CommitAnalytics {
  totalCommits: number;
  totalAuthors: number;
  totalAdditions: number;
  totalDeletions: number;
  avgCommitsPerDay: number;
  mostActiveAuthor: string;
  mostActiveDay: string;
  commitFrequency: { [key: string]: number };
  authorStats: { [key: string]: { commits: number; additions: number; deletions: number } };
  timeDistribution: { hour: number; count: number }[];
  dailyActivity: { date: string; commits: number; additions: number; deletions: number }[];
}

export interface ExtendedCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
  };
  author?: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
  filesChanged?: number;
  linesChanged?: number;
  commitType?: CommitType;
  messageLength?: number;
  dayOfWeek?: string;
  timeOfDay?: number;
  repository?: {
    name: string;
    full_name: string;
    html_url: string;
  };
}

export interface CommitFiltersState {
  searchTerm: string;
  timeFilter: TimeFilter;
  sortBy: SortBy;
  selectedAuthor: string;
  selectedRepo: string;
  selectedBranch: string;
}
