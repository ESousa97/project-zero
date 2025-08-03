// src/components/CommitHistory/types.ts - ATUALIZADO
export type TimeFilter = 
  | 'all' 
  | 'seconds-30' | 'seconds-60'
  | 'minutes-5' | 'minutes-15' | 'minutes-30' | 'minutes-60'
  | 'hours-1' | 'hours-6' | 'hours-12' | 'hours-24'
  | 'days-1' | 'days-3' | 'days-7'
  | 'weeks-1' | 'weeks-2' | 'weeks-4'
  | 'months-1' | 'months-2' | 'months-3' | 'months-6'
  | 'years-1' | 'years-2';

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

// Utility function to get milliseconds from TimeFilter
export const getTimeFilterMilliseconds = (filter: TimeFilter): number | null => {
  
  switch (filter) {
    case 'all': return null;
    
    // Seconds
    case 'seconds-30': return 30 * 1000;
    case 'seconds-60': return 60 * 1000;
    
    // Minutes
    case 'minutes-5': return 5 * 60 * 1000;
    case 'minutes-15': return 15 * 60 * 1000;
    case 'minutes-30': return 30 * 60 * 1000;
    case 'minutes-60': return 60 * 60 * 1000;
    
    // Hours
    case 'hours-1': return 1 * 60 * 60 * 1000;
    case 'hours-6': return 6 * 60 * 60 * 1000;
    case 'hours-12': return 12 * 60 * 60 * 1000;
    case 'hours-24': return 24 * 60 * 60 * 1000;
    
    // Days
    case 'days-1': return 1 * 24 * 60 * 60 * 1000;
    case 'days-3': return 3 * 24 * 60 * 60 * 1000;
    case 'days-7': return 7 * 24 * 60 * 60 * 1000;
    
    // Weeks
    case 'weeks-1': return 7 * 24 * 60 * 60 * 1000;
    case 'weeks-2': return 14 * 24 * 60 * 60 * 1000;
    case 'weeks-4': return 28 * 24 * 60 * 60 * 1000;
    
    // Months (approximate)
    case 'months-1': return 30 * 24 * 60 * 60 * 1000;
    case 'months-2': return 60 * 24 * 60 * 60 * 1000;
    case 'months-3': return 90 * 24 * 60 * 60 * 1000;
    case 'months-6': return 180 * 24 * 60 * 60 * 1000;
    
    // Years (approximate)
    case 'years-1': return 365 * 24 * 60 * 60 * 1000;
    case 'years-2': return 730 * 24 * 60 * 60 * 1000;
    
    default: return null;
  }
};

// Utility function to get human-readable label for TimeFilter
export const getTimeFilterLabel = (filter: TimeFilter): string => {
  switch (filter) {
    case 'all': return 'Todos os períodos';
    
    case 'seconds-30': return 'Últimos 30 segundos';
    case 'seconds-60': return 'Último minuto';
    
    case 'minutes-5': return 'Últimos 5 minutos';
    case 'minutes-15': return 'Últimos 15 minutos';
    case 'minutes-30': return 'Últimos 30 minutos';
    case 'minutes-60': return 'Última hora';
    
    case 'hours-1': return 'Última hora';
    case 'hours-6': return 'Últimas 6 horas';
    case 'hours-12': return 'Últimas 12 horas';
    case 'hours-24': return 'Último dia';
    
    case 'days-1': return 'Último dia';
    case 'days-3': return 'Últimos 3 dias';
    case 'days-7': return 'Última semana';
    
    case 'weeks-1': return 'Última semana';
    case 'weeks-2': return 'Últimas 2 semanas';
    case 'weeks-4': return 'Último mês';
    
    case 'months-1': return 'Último mês';
    case 'months-2': return 'Últimos 2 meses';
    case 'months-3': return 'Últimos 3 meses';
    case 'months-6': return 'Últimos 6 meses';
    
    case 'years-1': return 'Último ano';
    case 'years-2': return 'Últimos 2 anos';
    
    default: return 'Período desconhecido';
  }
};
