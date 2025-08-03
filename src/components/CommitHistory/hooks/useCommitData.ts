// src/components/CommitHistory/hooks/useCommitData.ts - CORRIGIDO
import { useState, useCallback, useMemo, useRef } from 'react';
import { useGitHub } from '../../../context/GitHubContext';
import type { Commit } from '../../../types/github';

export const useCommitData = () => {
  const { repositories, commits } = useGitHub();
  const [allReposCommits, setAllReposCommits] = useState<Commit[]>([]);
  const [loadingAllRepos, setLoadingAllRepos] = useState(false);
  
  // Use ref para controlar se já está fazendo fetch para evitar duplicação
  const fetchingRef = useRef(false);

  // Função para buscar commits de todos os repositórios
  const fetchAllRepositoriesCommits = useCallback(async () => {
    if (!repositories.length || fetchingRef.current) {
      console.log('Fetch já em andamento ou sem repositórios, ignorando...');
      return;
    }
    
    fetchingRef.current = true;
    setLoadingAllRepos(true);
    
    // Limpar commits anteriores antes de buscar novos
    setAllReposCommits([]);
    
    const allCommitsFromRepos: Commit[] = [];
    
    try {
      const recentRepos = repositories
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10);
      
      console.log(`Iniciando busca de commits em ${recentRepos.length} repositórios...`);
      
      // Processar repositórios em lotes menores para evitar sobrecarga
      const batchSize = 3;
      for (let i = 0; i < recentRepos.length; i += batchSize) {
        const batch = recentRepos.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (repo) => {
          try {
            console.log(`Buscando commits de ${repo.full_name}...`);
            
            const response = await fetch(
              `https://api.github.com/repos/${repo.full_name}/commits?per_page=50`,
              {
                headers: {
                  'Authorization': `token ${localStorage.getItem('github_token')}`,
                  'Accept': 'application/vnd.github.v3+json',
                },
              }
            );

            if (response.ok) {
              const repoCommits = await response.json();
              return repoCommits.map((commit: Commit) => ({
                ...commit,
                repository: {
                  name: repo.name,
                  full_name: repo.full_name,
                  html_url: repo.html_url
                }
              }));
            } else {
              console.warn(`Erro ao buscar commits de ${repo.name}: ${response.status}`);
              return [];
            }
          } catch (error) {
            console.error(`Erro ao buscar commits do repositório ${repo.name}:`, error);
            return [];
          }
        });
        
        // Aguardar o lote atual antes de processar o próximo
        const batchResults = await Promise.all(batchPromises);
        const flattenedResults = batchResults.flat();
        allCommitsFromRepos.push(...flattenedResults);
        
        // Pequeno delay entre lotes para ser gentil com a API
        if (i + batchSize < recentRepos.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Ordenar por data
      allCommitsFromRepos.sort((a, b) => 
        new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
      );
      
      console.log(`Total de commits coletados: ${allCommitsFromRepos.length}`);
      setAllReposCommits(allCommitsFromRepos);
      
    } catch (error) {
      console.error('Erro geral ao buscar commits de todos os repositórios:', error);
      setAllReposCommits([]); // Reset em caso de erro
    } finally {
      setLoadingAllRepos(false);
      fetchingRef.current = false;
    }
  }, [repositories]);

  // Memoizar commits atuais - CORRIGIDO para evitar duplicação
  const currentCommits = useMemo(() => {
    // Se temos commits do contexto (de um repositório específico), usar eles
    if (commits.length > 0) {
      console.log(`Usando commits do contexto: ${commits.length}`);
      return commits;
    }
    
    // Caso contrário, usar commits de todos os repos
    if (allReposCommits.length > 0) {
      console.log(`Usando commits de todos os repos: ${allReposCommits.length}`);
      return allReposCommits;
    }
    
    // Fallback para array vazio
    return [];
  }, [commits, allReposCommits]);

  return {
    currentCommits,
    allReposCommits,
    loadingAllRepos,
    fetchAllRepositoriesCommits
  };
};
