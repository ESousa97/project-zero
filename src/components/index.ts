// Componentes principais
export { default as Header } from './Header';
export { default as Sidebar } from './Sidebar';
export { default as LoadingOverlay } from './LoadingOverlay';
export { default as Breadcrumb } from './Breadcrumb';
export { default as AppLayout } from './AppLayout';
export { default as ViewRenderer } from './ViewRenderer';

// Componentes de views
export { default as Dashboard } from './Dashboard';
export { default as RepositoryList } from './RepositoryList';
export { default as CommitHistory } from './CommitHistory';
export { default as UserProfile } from './UserProfile';
export { default as Settings } from './Settings';
export { default as StatCard } from './StatCard';
export { default as TokenModal } from './TokenModal';

// Hooks e controladores
export { useAppController } from './AppController';
export { useNotificationManager } from './NotificationManager';

// Tipos exportados
export type { ViewType, MenuItem, BreadcrumbItem, Notification } from '../types/app';
