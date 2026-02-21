import { describe, expect, it } from 'vitest';
import { isValidGitHubToken, normalizeGitHubToken } from '../../src/utils/githubToken';

describe('github token utils', () => {
  it('normalizes token by trimming spaces', () => {
    expect(normalizeGitHubToken('  ghp_123  ')).toBe('ghp_123');
  });

  it('accepts valid PAT prefixes', () => {
    expect(isValidGitHubToken('ghp_abcdefghijklmnopqrstuvwxyz')).toBe(true);
    expect(isValidGitHubToken('github_pat_abcdefghijklmnopqrstuvwxyz')).toBe(true);
  });

  it('rejects invalid token formats', () => {
    expect(isValidGitHubToken('token_123')).toBe(false);
    expect(isValidGitHubToken('')).toBe(false);
    expect(isValidGitHubToken('   ')).toBe(false);
  });
});
