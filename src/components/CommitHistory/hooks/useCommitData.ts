
// src/components/CommitHistory/hooks/useCommitData.ts - CORRIGIDO
import { useState, useCallback, useMemo } from 'react';
import { useGitHub } from '../../../context/GitHubContext';
import type { Commit } from '../../../types/github';

export const useCommitData = () => {
  const { repositories, commits } = useGitHub();
  const [allReposCommits, setAllReposCommits] = useState<Commit[]>([]);
  const [loadingAllRepos, setLoadingAllRepos] = useState(false);

  // Função para buscar commits de todos os repositórios
  const fetchAllRepositoriesCommits = useCallback(async () => {
    if (!repositories.length) return;
    
    setLoadingAllRepos(true);
    const allCommitsFromRepos: Commit[] = [];
    
    try {
      const recentRepos = repositories
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10);
      
      console.log(`🔄 Iniciando busca de commits em ${recentRepos.length} repositórios...`);
      
      for (const repo of recentRepos) {
        try {
          console.log(`📡 Buscando commits de ${repo.full_name}...`);
          
          const response = await fetch(
            `https://api.github.com/repos/${repo.full_name}/commits?per_page=100`,
            {
              headers: {
                'Authorization': `token ${localStorage.getItem('github_token')}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            }
          );

          if (response.ok) {
            const repoCommits = await response.json();
            const commitsWithRepo = repoCommits.map((commit: Commit) => ({
              ...commit,
              repository: {
                name: repo.name,
                full_name: repo.full_name,
                html_url: repo.html_url
              }
            }));
            
            allCommitsFromRepos.push(...commitsWithRepo);
            console.log(`✅ ${repoCommits.length} commits coletados de ${repo.name}`);
          } else {
            console.warn(`⚠️ Erro ao buscar commits de ${repo.name}: ${response.status}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`❌ Erro ao buscar commits do repositório ${repo.name}:`, error);
        }
      }
      
      allCommitsFromRepos.sort((a, b) => 
        new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
      );
      
      console.log(`🎯 Total de commits coletados: ${allCommitsFromRepos.length}`);
      setAllReposCommits(allCommitsFromRepos);
      
    } catch (error) {
      console.error('❌ Erro geral ao buscar commits de todos os repositórios:', error);
    } finally {
      setLoadingAllRepos(false);
    }
  }, [repositories]);

  // Processar commits com informações estendidas
  const currentCommits = useMemo(() => {
    return commits.length > 0 ? commits : allReposCommits;
  }, [commits, allReposCommits]);

  return {
    currentCommits,
    allReposCommits,
    loadingAllRepos,
    fetchAllRepositoriesCommits
  };
};
