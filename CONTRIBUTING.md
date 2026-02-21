# Contributing

> Arquivado: este repositório não está mais ativo.
> Mantido público apenas para fins de estudo.
> Não há garantia de resposta, revisão, merge ou correção de issues/PRs.

## Development setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Code style and conventions

- TypeScript strict, sem `any` sem necessidade real.
- ESLint e Prettier são obrigatórios.
- Estrutura de commits segue Conventional Commits.

Comandos de qualidade:

```bash
npm run lint
npm run format:check
npm run test
npm run build
```

## Branch, commit e PR workflow

- Branch naming: `feat/<descricao>`, `fix/<descricao>`, `chore/<descricao>`.
- Commits:

```text
<type>(<scope>): <description>
```

Tipos permitidos:
- `feat` — nova funcionalidade
- `fix` — correção de bug
- `refactor` — refatoração sem mudança funcional
- `docs` — documentação
- `style` — formatação
- `test` — testes
- `chore` — manutenção/configuração
- `ci` — CI/CD
- `perf` — performance
- `security` — segurança

- Abra PR para `main` com checklist completo em `.github/PULL_REQUEST_TEMPLATE.md`.

## Testes

- Unitários: `npm run test`
- Cobertura: `npm run test:coverage`

## Áreas com maior valor de contribuição

- Testes de integração do `GitHubContext`
- Melhoria de UX de erros de autenticação
- Otimização de renderização de gráficos para grandes volumes

## Maintainer

- Portfólio: https://enoquesousa.vercel.app
- GitHub: https://github.com/ESousa97
