// src/components/CommitHistory/index.ts - CORRIGIDO
// Exportar apenas o componente principal
export { default } from './CommitHistory';

// Exportar componentes individuais se necessário
export { default as CommitCard } from './CommitCard';
export { default as CommitList } from './CommitList';
export { default as CommitTimeline } from './CommitTimeline';
export { default as CommitFilters } from './CommitFilters';
export { default as CommitAnalyticsComponent } from './CommitAnalytics';

// Exportar tipos necessários para uso externo
export type { 
  ExtendedCommit, 
  CommitFiltersState, 
  CommitAnalytics as CommitAnalyticsType, 
  ViewMode, 
  CommitType 
} from './types';
