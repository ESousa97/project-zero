// src/components/CommitHistory/hooks/useCommitAnalytics.ts
import { useMemo } from 'react';
import type { ExtendedCommit, CommitAnalytics } from '../types';

export const useCommitAnalytics = (commits: ExtendedCommit[]): CommitAnalytics => {
  return useMemo(() => {
    if (!commits.length) return {
      totalCommits: 0,
      totalAuthors: 0,
      totalAdditions: 0,
      totalDeletions: 0,
      avgCommitsPerDay: 0,
      mostActiveAuthor: '',
      mostActiveDay: '',
      commitFrequency: {},
      authorStats: {},
      timeDistribution: [],
      dailyActivity: []
    };

    const authorStats: { [key: string]: { commits: number; additions: number; deletions: number } } = {};
    const dailyStats: { [key: string]: { commits: number; additions: number; deletions: number } } = {};
    const hourStats: { [key: number]: number } = {};
    const dayStats: { [key: string]: number } = {};

    let totalAdditions = 0;
    let totalDeletions = 0;

    commits.forEach(commit => {
      const author = commit.commit.author.name;
      const date = new Date(commit.commit.author.date);
      const dateKey = date.toISOString().split('T')[0];
      const hour = date.getHours();
      const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });

      // Estatísticas por autor
      if (!authorStats[author]) {
        authorStats[author] = { commits: 0, additions: 0, deletions: 0 };
      }
      authorStats[author].commits += 1;
      authorStats[author].additions += commit.stats?.additions || 0;
      authorStats[author].deletions += commit.stats?.deletions || 0;

      // Estatísticas diárias
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { commits: 0, additions: 0, deletions: 0 };
      }
      dailyStats[dateKey].commits += 1;
      dailyStats[dateKey].additions += commit.stats?.additions || 0;
      dailyStats[dateKey].deletions += commit.stats?.deletions || 0;

      // Estatísticas por hora
      hourStats[hour] = (hourStats[hour] || 0) + 1;

      // Estatísticas por dia da semana
      dayStats[dayOfWeek] = (dayStats[dayOfWeek] || 0) + 1;

      totalAdditions += commit.stats?.additions || 0;
      totalDeletions += commit.stats?.deletions || 0;
    });

    const mostActiveAuthor = Object.entries(authorStats)
      .sort((a, b) => b[1].commits - a[1].commits)[0]?.[0] || '';

    const mostActiveDay = Object.entries(dayStats)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    const timeDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourStats[hour] || 0
    }));

    const dailyActivity = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        commits: stats.commits,
        additions: stats.additions,
        deletions: stats.deletions
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    const dayRange = dailyActivity.length > 0 ? dailyActivity.length : 1;
    const avgCommitsPerDay = commits.length / dayRange;

    return {
      totalCommits: commits.length,
      totalAuthors: Object.keys(authorStats).length,
      totalAdditions,
      totalDeletions,
      avgCommitsPerDay,
      mostActiveAuthor,
      mostActiveDay,
      commitFrequency: dayStats,
      authorStats,
      timeDistribution,
      dailyActivity
    };
  }, [commits]);
};
