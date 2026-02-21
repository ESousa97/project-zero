# Setup

## Local development

```bash
git clone https://github.com/ESousa97/project-zero.git
cd project-zero
npm install
cp .env.example .env
npm run dev
```

## Quality checks

```bash
npm run lint
npm run test
npm run build
npm run validate
```

## Environment variables

Use `.env.example` as reference:

- `NODE_ENV`
- `VITE_APP_NAME`
- `VITE_GITHUB_API_BASE`
- `VITE_ENABLE_ANALYTICS`

## CI parity

To mirror CI locally:

```bash
npm ci
npm run lint
npm run test:coverage
npm run build
```
