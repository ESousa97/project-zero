# GitVision Pro

> Plataforma web para análise avançada de atividade em repositórios GitHub.

![CI](https://github.com/ESousa97/project-zero/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/github/license/ESousa97/project-zero)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![Last Commit](https://img.shields.io/github/last-commit/ESousa97/project-zero)
![CodeFactor](https://www.codefactor.io/repository/github/esousa97/project-zero/badge)
![Issues](https://img.shields.io/github/issues/ESousa97/project-zero)

---

GitVision Pro consolida dados da API do GitHub em dashboards interativos para observabilidade de produtividade, atividade de commits, distribuição de linguagens e saúde de repositórios. A aplicação é uma SPA React/TypeScript executada no cliente, com persistência local segura de preferências e token de acesso. O foco é produtividade técnica com visualização clara, filtros operacionais e métricas acionáveis.

## Demonstração

- Produção: https://project-zero-seven.vercel.app
- Execução local:

```bash
npm install
npm run dev
```

## Stack Tecnológico

| Tecnologia | Papel |
|---|---|
| React 19 | Interface e composição de componentes |
| TypeScript 5 | Tipagem estática e contratos |
| Vite 7 | Build, dev server e bundling |
| Tailwind CSS 3 | Estilização utilitária |
| Recharts | Gráficos analíticos |
| ESLint + Prettier | Qualidade e padronização |
| Vitest + Testing Library | Testes unitários |

## Pré-requisitos

- Node.js >= 20
- npm >= 10
- Token de acesso pessoal do GitHub (PAT) com permissões adequadas para leitura de repositórios

## Instalação e Uso

```bash
git clone https://github.com/ESousa97/project-zero.git
cd project-zero
npm install
cp .env.example .env
npm run dev
```

Aplicação disponível em `http://localhost:5173`.

## Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia ambiente de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Serve build localmente |
| `npm run lint` | Executa lint |
| `npm run lint:fix` | Corrige problemas de lint automaticamente |
| `npm run test` | Executa testes unitários |
| `npm run test:watch` | Executa testes em modo watch |
| `npm run test:coverage` | Executa testes com cobertura |
| `npm run format` | Formata código |
| `npm run format:check` | Valida formatação |
| `npm run validate` | Pipeline local (`lint` + `test` + `build`) |

## Arquitetura

```text
src/
├── components/      # Componentes de UI e views
├── context/         # Estado global e integração com GitHub API
├── constants/       # Constantes compartilhadas (tema, gráficos)
├── styles/          # Tokens e estilos globais
├── test/            # Setup de testes
├── types/           # Contratos TypeScript
└── utils/           # Funções utilitárias puras
```

Detalhes adicionais em `docs/architecture.md` e `docs/setup.md`.

## API Reference

Integração com GitHub REST API (cliente):
- `GET /user`
- `GET /user/repos`
- `GET /repos/{owner}/{repo}/commits`
- `GET /repos/{owner}/{repo}/languages`

Base URL padrão configurável via `VITE_GITHUB_API_BASE`.

## Roadmap

- [x] Padronização de lint, format e testes
- [x] CI com matriz de versões Node
- [x] Dependabot e auditoria de segurança
- [x] Centralização de tokens de estilo e tema de gráficos
- [ ] Expandir cobertura de testes para integrações de contexto
- [ ] Melhorar estratégia de autenticação para reduzir dependência de `localStorage`

## Contribuindo

Consulte `CONTRIBUTING.md` para convenções, fluxo de PR e padrões de commit.

## Licença

Projeto licenciado sob MIT. Consulte `LICENSE`.

## Autor

- Enoque Sousa
- Portfólio: https://enoquesousa.vercel.app
- GitHub: https://github.com/ESousa97
