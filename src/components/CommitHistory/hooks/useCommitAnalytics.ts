// src/components/CommitHistory/hooks/useCommitAnalytics.ts - CORRIGIDO
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
    const commitTypeStats: { [key: string]: number } = {};

    let totalAdditions = 0;
    let totalDeletions = 0;
    const commitDates: Date[] = [];

    commits.forEach(commit => {
      const author = commit.commit.author.name;
      const date = new Date(commit.commit.author.date);
      const dateKey = date.toISOString().split('T')[0];
      const hour = date.getHours();
      const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });
      const commitType = commit.commitType || 'other';

      // Rastrear período de tempo dos commits
      commitDates.push(date);

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

      // Estatísticas por hora do dia
      hourStats[hour] = (hourStats[hour] || 0) + 1;

      // Estatísticas por dia da semana
      dayStats[dayOfWeek] = (dayStats[dayOfWeek] || 0) + 1;

      // Estatísticas por tipo de commit
      commitTypeStats[commitType] = (commitTypeStats[commitType] || 0) + 1;

      // Totais
      totalAdditions += commit.stats?.additions || 0;
      totalDeletions += commit.stats?.deletions || 0;
    });

    // Calcular autor mais ativo
    const mostActiveAuthor = Object.entries(authorStats)
      .sort((a, b) => b[1].commits - a[1].commits)[0]?.[0] || '';

    // Calcular dia da semana mais ativo
    const mostActiveDay = Object.entries(dayStats)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Distribuição por hora do dia (0-23)
    const timeDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourStats[hour] || 0
    }));

    // Atividade diária - usar apenas os dados reais dos commits filtrados
    const dailyActivity = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        commits: stats.commits,
        additions: stats.additions,
        deletions: stats.deletions
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calcular média de commits por dia baseada no período real dos dados
    let avgCommitsPerDay = 0;
    if (commitDates.length > 0) {
      const sortedDates = commitDates.sort((a, b) => a.getTime() - b.getTime());
      const earliestDate = sortedDates[0];
      const latestDate = sortedDates[sortedDates.length - 1];
      
      const daysDifference = Math.max(1, Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)));
      avgCommitsPerDay = commits.length / daysDifference;
    }

    const analytics = {
      totalCommits: commits.length,
      totalAuthors: Object.keys(authorStats).length,
      totalAdditions,
      totalDeletions,
      avgCommitsPerDay,
      mostActiveAuthor,
      mostActiveDay,
      commitFrequency: { ...dayStats, ...commitTypeStats }, // Combinar ambos
      authorStats,
      timeDistribution,
      dailyActivity
    };
    
    return analytics;
  }, [commits]);
};
