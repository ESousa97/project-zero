// src/components/CommitHistory/hooks/useCommitData.ts - CORRIGIDO
import { useState, useCallback, useMemo, useRef } from 'react';
import { useGitHub } from '../../../context/GitHubContext';
import type { Commit } from '../../../types/github';

export const useCommitData = () => {
  const { repositories, commits } = useGitHub();
  const [allReposCommits, setAllReposCommits] = useState<Commit[]>([]);
  const [loadingAllRepos, setLoadingAllRepos] = useState(false);
  
  const fetchingRef = useRef(false);

  // BUSCA COMPLETA ABSOLUTA - SEM LIMITES
  const fetchAllRepositoriesCommits = useCallback(async () => {
    if (!repositories.length || fetchingRef.current) return;
    
    fetchingRef.current = true;
    setLoadingAllRepos(true);
    setAllReposCommits([]);
    
    const allCommitsFromRepos: Commit[] = [];
    
    try {
      // TODOS os repositórios sem exceção
      const allRepos = repositories.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      
      // Processar cada repositório individualmente para melhor controle
      for (let i = 0; i < allRepos.length; i++) {
        const repo = allRepos[i];
        
        try {
          let page = 1;
          let hasMoreCommits = true;
          const repoCommits: Commit[] = [];
          
          // BUSCA INFINITA - não para até acabar os commits
          while (hasMoreCommits) {
            try {
              const response = await fetch(
                `https://api.github.com/repos/${repo.full_name}/commits?per_page=100&page=${page}`,
                {
                  headers: {
                    'Authorization': `token ${localStorage.getItem('github_token')}`,
                    'Accept': 'application/vnd.github.v3+json',
                  },
                }
              );

              if (response.ok) {
                const pageCommits = await response.json();
                
                if (pageCommits.length === 0) {
                  hasMoreCommits = false;
                  break;
                }
                
                repoCommits.push(...pageCommits);
                page++;
                
                // Rate limiting mínimo
                await new Promise(resolve => setTimeout(resolve, 50));
                
              } else if (response.status === 403) {
                // Rate limit - aguardar e tentar novamente
                await new Promise(resolve => setTimeout(resolve, 30000));
                // Não incrementar página, tentar novamente
                continue;
                
              } else if (response.status === 404) {
                // Repositório não encontrado ou sem commits
                hasMoreCommits = false;
                
              } else {
                // Tentar próxima página em caso de erro temporário
                page++;
                if (page > 1000) { // Proteção contra loop infinito
                  hasMoreCommits = false;
                }
              }
              
            } catch (_fetchError) {
              // Aguardar e tentar novamente
              await new Promise(resolve => setTimeout(resolve, 5000));
              continue;
            }
          }
          
          // Adicionar info do repositório
          const commitsWithRepo = repoCommits.map((commit: Commit) => ({
            ...commit,
            repository: {
              name: repo.name,
              full_name: repo.full_name,
              html_url: repo.html_url
            }
          }));
          
          allCommitsFromRepos.push(...commitsWithRepo);
          
          // Delay entre repositórios
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (_error) {
          continue; // Continuar com próximo repositório
        }
      }
      
      // Ordenar por data
      allCommitsFromRepos.sort((a, b) => 
        new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
      );
      
      setAllReposCommits(allCommitsFromRepos);
      
    } catch (_error) {
      setAllReposCommits([]);
    } finally {
      setLoadingAllRepos(false);
      fetchingRef.current = false;
    }
  }, [repositories]);

  // CORRIGIDO: Usar sempre todos os commits disponíveis
  const currentCommits = useMemo(() => {
    if (commits.length > 0 && allReposCommits.length === 0) {
      // Commits de repositório específico
      return commits;
    }
    
    if (allReposCommits.length > 0) {
      // Commits de todos os repositórios
      return allReposCommits;
    }
    
    return [];
  }, [commits, allReposCommits]);

  return {
    currentCommits,
    allReposCommits,
    loadingAllRepos,
    fetchAllRepositoriesCommits
  };
};
