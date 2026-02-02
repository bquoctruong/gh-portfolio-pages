# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal portfolio website served by a custom Node.js HTTP server (no framework). The server serves static files from `public/`, proxies specific routes to a GCP-hosted Ollama WebUI instance, and exposes utility endpoints (`/time`, `/python_get`). Deployed across multiple cloud targets: AWS S3, AWS Lambda, GCP Cloud Run, and Render.com.

## Common Commands

### Run locally
```bash
npm start                # Starts the server on PORT (default 80)
```

### Run tests
```bash
npm test                 # Jest tests via CommonJS bridge
npm run test:watch       # Jest in watch mode
npm run test:esm         # ESM-native tests (experimental)
```

### Run a single test file
```bash
node --no-warnings ./node_modules/jest/bin/jest.js --config=jest.config.cjs tests/index.test.js
```

### Docker
```bash
docker build -t gh-portfolio-pages .
docker run -p 80:80 gh-portfolio-pages
```

## Architecture

### Server entry points

- **`src/index.js`** — Main ES Module HTTP server. Serves static files, handles proxy routing, sets security headers. This is what runs in Docker/Cloud Run.
- **`src/index.cjs`** — CommonJS mirror of `index.js` used as a bridge for Jest testing (Jest has limited ESM support).
- **`src/index.mjs`** — AWS Lambda handler. Returns Lambda-compatible response objects with base64 encoding for binary content.
- **`src/instrumentation.cjs`** — OpenTelemetry auto-instrumentation setup, loaded via `--require` flag at container startup.

### Testing bridge pattern

Tests cannot directly import ES Modules into Jest. Instead:
1. `src/index.js` (ESM) is the real implementation
2. `src/index.cjs` (CJS) re-implements the same functions for testability
3. `tests/index.test.js` imports from the CJS bridge
4. Coverage is collected against `src/index.cjs` only

When modifying server logic, changes must be made in **both** `src/index.js` and `src/index.cjs` to keep them in sync.

### Request routing logic (in `src/index.js`)

1. `/time` — returns UTC time as JSON
2. `/python_get` — spawns a Python subprocess
3. Local file exists in `public/` — serve it with correct MIME type
4. URL matches a proxy path (`/deepseek`, `/api`, `/ollama`, etc.) AND no local file exists — proxy to GCP target
5. Otherwise — 404

### CI/CD pipeline

Workflows in `.github/workflows/`:
- **`test.yml`** — Runs Jest tests on push/PR to main
- **`docker-security-test.yml`** — Hadolint, Trivy vulnerability scan, container structure test, OWASP ZAP scan
- **`codeql.yml`** — CodeQL static analysis on all branches
- **`build-deploy-aws-s3.yml`** — Syncs `public/` to S3 on push to main
- **`build-deploy-aws-sandbox.yml`** — Packages and deploys Lambda function for non-main branches
- **`build-deploy-gcp-prod.yml`** — Builds Docker image and deploys to Cloud Run on main
- **`build-deploy-render.yml`** — Deploys to Render.com after CodeQL passes

Deployment workflows run only after security tests pass. The ZAP scan rules in `.zap/rules.tsv` suppress known false positives.

### Docker image

Multi-stage build on `node:20-alpine`. Runs as non-root `node` user with `tini` for signal handling. Uses `setcap` to allow binding to port 80 without root. Exposes both 80 and 8080 (Cloud Run uses 8080 via `PORT` env var).

## Key Configuration

- **Module system**: ES Modules (`"type": "module"` in package.json). CJS files use `.cjs` extension.
- **Node version**: >=20.0.0
- **Test framework**: Jest 29, configured in `jest.config.cjs`, 10s timeout
- **Credentials**: `key.json` is git-ignored and contains GCP service account credentials — never commit it.
