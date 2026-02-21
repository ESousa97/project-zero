# Architecture

## Overview

GitVision Pro is a client-side SPA built with React and TypeScript. The application consumes GitHub REST APIs directly from the browser and renders analytical views for repositories, commits and developer profile metrics.

## Main modules

- `src/components`: UI composition and domain views.
- `src/context`: global state and API orchestration.
- `src/constants`: shared visual and behavior constants.
- `src/utils`: pure reusable utilities.
- `src/styles`: design tokens and global styles.

## Data flow

1. User enters a GitHub PAT.
2. Token is validated and persisted locally.
3. `GitHubContext` orchestrates fetches via `GitHubAPI` and `GitHubServices`.
4. Components consume state and render metrics/charts.

## Design decisions

- Context API instead of external state manager to keep architecture lean.
- Shared chart constants to reduce color/style duplication.
- Client-side only architecture prioritizes simplicity and low operational cost.

## Known trade-offs

- Token persistence in browser storage increases XSS sensitivity.
- Public GitHub API limits may impact large-scale usage.
