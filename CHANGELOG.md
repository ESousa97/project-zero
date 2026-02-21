# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

## [0.1.1] - 2026-02-21

### Changed
- Repository marked as archived for study-only usage in governance documents.
- Issue and PR templates now display explicit archival warning.
- Issue template chooser now includes archived-project notice link with blank issues disabled.

### Chore
- Dependabot configured to stop opening new pull requests.

## [0.1.0] - 2026-02-21

### Added
- Baseline technical report generation (`BASELINE.md`) and internal report policy.
- Repository governance files: issue templates, PR template, CODEOWNERS, CI workflows and Dependabot.
- Developer standards: `.editorconfig`, `.gitattributes`, `.prettierrc`, `.prettierignore`, `.env.example`.
- Testing stack with Vitest + Testing Library and initial unit tests.
- Security and collaboration documents: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.
- Centralized design/token files under `src/styles` and chart theme constants under `src/constants`.

### Changed
- `README.md` rewritten for production-grade onboarding and maintenance.
- `main.tsx` now uses structured global stylesheet.
- `package.json` scripts expanded with lint fix, formatting, tests and validate pipeline.
- Chart components now consume shared constants to reduce hardcoded visual duplication.
- GitHub token validation logic extracted to reusable utility.

### Removed
- Legacy template stylesheets (`src/App.css`, `src/index.css`, `src/style.css`).

### Security
- Automated security workflow added (`security-audit.yml`).
- Dependency review workflow added for lockfile changes.

[0.1.0]: https://github.com/ESousa97/project-zero/releases/tag/v0.1.0
