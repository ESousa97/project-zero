const PAT_PREFIXES = ['ghp_', 'github_pat_'] as const;

export const normalizeGitHubToken = (token: string): string => token.trim();

export const isValidGitHubToken = (token: string): boolean => {
  const normalized = normalizeGitHubToken(token);
  if (!normalized) return false;
  return PAT_PREFIXES.some((prefix) => normalized.startsWith(prefix));
};
