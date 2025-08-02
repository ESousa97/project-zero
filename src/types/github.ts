// Enhanced GitHub API Types

export interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: License | null;
  allow_forking: boolean;
  is_template: boolean;
  web_commit_signoff_required: boolean;
  topics: string[];
  visibility: 'public' | 'private';
  forks: number;
  forks_count: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  temp_clone_token: string | null;
  network_count: number;
  subscribers_count: number;
  private: boolean;
  
  // Enhanced properties
  languages_data?: { [key: string]: number };
  contributors_data?: Contributor[];
  contributor_count?: number;
  
  // Owner information
  owner: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string | null;
    url: string;
    html_url: string;
    type: 'User' | 'Organization';
    site_admin: boolean;
  };
}

export interface License {
  key: string;
  name: string;
  spdx_id: string | null;
  url: string | null;
  node_id: string;
}

export interface Contributor {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  type: 'User' | 'Bot';
  site_admin: boolean;
  contributions: number;
}

export interface Commit {
  sha: string;
  node_id: string;
  commit: {
    author: GitUser;
    committer: GitUser;
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: GitHubUser | null;
  committer: GitHubUser | null;
  parents: {
    sha: string;
    url: string;
    html_url: string;
  }[];
  
  // Enhanced commit data
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
  files?: CommitFile[];
}

export interface GitUser {
  name: string;
  email: string;
  date: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  type: 'User' | 'Bot';
  site_admin: boolean;
}

export interface CommitFile {
  sha: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
  previous_filename?: string;
}

export interface User {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  type: 'User';
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  private_gists?: number;
  total_private_repos?: number;
  owned_private_repos?: number;
  disk_usage?: number;
  collaborators?: number;
  two_factor_authentication?: boolean;
  plan?: {
    name: string;
    space: number;
    private_repos: number;
    collaborators: number;
  };
  
  // Enhanced user data
  recent_events?: Event[];
  organizations?: Organization[];
  starred_repos?: Repository[];
}

export interface Event {
  id: string;
  type: string;
  actor: GitHubUser;
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: any;
  public: boolean;
  created_at: string;
}

export interface Organization {
  login: string;
  id: number;
  node_id: string;
  url: string;
  repos_url: string;
  events_url: string;
  hooks_url: string;
  issues_url: string;
  members_url: string;
  public_members_url: string;
  avatar_url: string;
  description: string | null;
  gravatar_id: string | null;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  twitter_username: string | null;
  is_verified: boolean;
  has_organization_projects: boolean;
  has_repository_projects: boolean;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
  updated_at: string;
  type: 'Organization';
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
  protection?: {
    enabled: boolean;
    required_status_checks: {
      enforcement_level: string;
      contexts: string[];
    };
  };
  protection_url?: string;
}

export interface Tag {
  name: string;
  zipball_url: string;
  tarball_url: string;
  commit: {
    sha: string;
    url: string;
  };
  node_id: string;
}

export interface Release {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: GitHubUser;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string | null;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string | null;
  assets: ReleaseAsset[];
  tarball_url: string | null;
  zipball_url: string | null;
  body: string | null;
  body_html?: string;
  body_text?: string;
  mentions_count?: number;
  discussion_url?: string;
  reactions?: Reactions;
}

export interface ReleaseAsset {
  url: string;
  id: number;
  node_id: string;
  name: string;
  label: string | null;
  uploader: GitHubUser;
  content_type: string;
  state: 'uploaded' | 'open';
  size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  browser_download_url: string;
}

export interface Issue {
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: GitHubUser;
  labels: Label[];
  state: 'open' | 'closed';
  locked: boolean;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  milestone: Milestone | null;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  author_association: string;
  active_lock_reason: string | null;
  draft?: boolean;
  pull_request?: {
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
    merged_at: string | null;
  };
  body: string | null;
  body_html?: string;
  body_text?: string;
  timeline_url?: string;
  repository?: Repository;
  performed_via_github_app?: any;
  state_reason?: string | null;
  reactions?: Reactions;
}

export interface PullRequest {
  url: string;
  id: number;
  node_id: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  number: number;
  state: 'open' | 'closed';
  locked: boolean;
  title: string;
  user: GitHubUser;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  requested_reviewers: GitHubUser[];
  requested_teams: Team[];
  labels: Label[];
  milestone: Milestone | null;
  draft: boolean;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  head: PullRequestRef;
  base: PullRequestRef;
  _links: {
    self: { href: string };
    html: { href: string };
    issue: { href: string };
    comments: { href: string };
    review_comments: { href: string };
    review_comment: { href: string };
    commits: { href: string };
    statuses: { href: string };
  };
  author_association: string;
  auto_merge: any | null;
  active_lock_reason: string | null;
  merged: boolean;
  mergeable: boolean | null;
  rebaseable: boolean | null;
  mergeable_state: string;
  merged_by: GitHubUser | null;
  comments: number;
  review_comments: number;
  maintainer_can_modify: boolean;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  reactions?: Reactions;
}

export interface PullRequestRef {
  label: string;
  ref: string;
  sha: string;
  user: GitHubUser;
  repo: Repository | null;
}

export interface Label {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string | null;
}

export interface Milestone {
  url: string;
  html_url: string;
  labels_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  description: string | null;
  creator: GitHubUser;
  open_issues: number;
  closed_issues: number;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  due_on: string | null;
  closed_at: string | null;
}

export interface Team {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  name: string;
  slug: string;
  description: string | null;
  privacy: 'secret' | 'closed';
  permission: string;
  members_url: string;
  repositories_url: string;
  parent: Team | null;
}

export interface Reactions {
  url: string;
  total_count: number;
  '+1': number;
  '-1': number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

export interface ContributorStats {
  author: GitHubUser;
  total: number;
  weeks: WeeklyStats[];
}

export interface WeeklyStats {
  w: number; // Start of week (Unix timestamp)
  a: number; // Additions
  d: number; // Deletions
  c: number; // Commits
}

export interface CodeFrequency {
  week: number; // Unix timestamp
  additions: number;
  deletions: number;
}

export interface Participation {
  all: number[];
  owner: number[];
}

export interface PunchCard {
  day: number; // 0-6 (Sunday to Saturday)
  hour: number; // 0-23
  commits: number;
}

export interface RepositoryContent {
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  size: number;
  name: string;
  path: string;
  content?: string;
  encoding?: string;
  sha: string;
  url: string;
  git_url: string | null;
  html_url: string | null;
  download_url: string | null;
  _links: {
    git: string | null;
    self: string;
    html: string | null;
  };
}

export interface SearchResult<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

export interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
  resource: string;
}

export interface RateLimitResponse {
  resources: {
    core: RateLimit;
    search: RateLimit;
    graphql: RateLimit;
    integration_manifest: RateLimit;
    source_import: RateLimit;
    code_scanning_upload: RateLimit;
    actions_runner_registration: RateLimit;
    scim: RateLimit;
  };
  rate: RateLimit;
}

// Utility types for enhanced functionality
export interface RepositoryMetrics {
  health_score: number;
  activity_score: number;
  popularity_score: number;
  quality_score: number;
  maintenance_score: number;
}

export interface ContributorInsights {
  top_contributors: Contributor[];
  contribution_distribution: { [key: string]: number };
  new_contributors_this_period: number;
  returning_contributors: number;
}

export interface LanguageInsights {
  primary_language: string;
  language_distribution: { [key: string]: number };
  language_trends: { language: string; growth: number }[];
}

export interface ActivityInsights {
  commits_this_week: number;
  commits_this_month: number;
  most_active_day: string;
  most_active_hour: number;
  streak_days: number;
  productivity_trend: 'increasing' | 'decreasing' | 'stable';
}

export interface RepositoryInsights {
  metrics: RepositoryMetrics;
  contributors: ContributorInsights;
  languages: LanguageInsights;
  activity: ActivityInsights;
  recommendations: string[];
}

// Error types
export interface GitHubError {
  message: string;
  errors?: Array<{
    resource: string;
    field: string;
    code: string;
  }>;
  documentation_url?: string;
}

// API Response types
export interface GitHubApiResponse<T> {
  data: T;
  status: number;
  headers: { [key: string]: string };
  url: string;
}
