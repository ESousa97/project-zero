# Security Policy

> Arquivado: este repositório não está mais ativo.
> Mantido público apenas para fins de estudo.
> Não há garantia de resposta, revisão ou correção dentro de SLA.

## Supported Versions

| Version | Supported |
|---|---|
| main | Yes |
| legacy branches | No |

## Reporting a Vulnerability

Do not open public issues for security vulnerabilities.

Preferred channels:
- GitHub Security Advisories: https://github.com/ESousa97/project-zero/security/advisories
- Private contact via GitHub profile: https://github.com/ESousa97

## Response SLA

As janelas abaixo eram válidas durante manutenção ativa e agora são apenas referência histórica.

- Initial triage: up to 72 hours
- Severity classification: up to 5 business days
- Mitigation patch target:
  - Critical/High: up to 7 business days
  - Moderate: up to 14 business days
  - Low: next scheduled maintenance

## Disclosure policy

- Coordinated disclosure is required.
- Public disclosure is performed after mitigation release or explicit maintainer approval.

## Security notes for this project

- GitHub token is stored locally in browser storage by design for client-only architecture.
- Never use highly privileged PATs.
- Prefer short-lived tokens and minimum scopes.
