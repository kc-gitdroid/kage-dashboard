# Kage Dashboard

Kage Dashboard is a Next.js app for managing the command-center workflow across Home, Brands, Projects, Calendar, Tasks, Notes, and Prompts.

## Canonical Project Root

Use this folder as the only working project root:

```bash
/Users/kage/Codex-clean
```

Do not use the older Desktop symlinked workspace for development or preview.

## Requirements

- Node.js 20 or newer
- npm

## Install

```bash
npm ci
```

## Run Dev Preview

```bash
npm run dev
```

Then open:

- `http://127.0.0.1:3000`

## Run Production Build

```bash
npm run build
```

## Run Production Server

```bash
npm run start
```

## Main Routes

- `/`
- `/brands`
- `/projects`
- `/calendar`
- `/tasks`
- `/notes`
- `/prompts`

## Notes

- The repo ignores generated build output, local sync state, local environment files, and installed dependencies.
- Sync can use Upstash when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are provided, but those values should live in local environment files and never be committed.
