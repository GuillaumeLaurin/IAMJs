# CI/CD Workflows

This directory contains the GitHub Actions workflows for the `iam-js` application. The pipeline is split into workflows called by a single orchestrator to maximize cache reuse and keep each concern isolated.

---

## Overview

```
Trigger (push → main / pull_request)
         │
         ▼
   [actionlint]         — validate workflow YAML files
         │
         ▼
    [install]           — npm ci + build + cache node_modules
         │
    ┌────┴────┐
    ▼         ▼
  [lint]   [test]       — run in parallel, both restore from cache
```

---

## Trigger conditions

| Event | Branches |
|---|---|
| `push` | `main` only |
| `pull_request` | all branches |

---

## Workflows

### `ci.yml` — Orchestrator

The entry point. Calls all workflows in the correct order and passes the cache key produced by `install` downstream to `lint` and `test`.

**Jobs:**

| Job | Depends on | Description |
|---|---|---|
| `actionlint` | — | Lints the workflow YAML files themselves |
| `install` | `actionlint` | Installs dependencies, builds, and saves cache |
| `lint` | `install` | Restores cache and runs `npm run lint` |
| `test` | `install` | Restores cache and runs `npm test` |

---

### `install.yml`

Handles dependency installation and build. Implements a two-step cache strategy to avoid redundant `npm ci` calls across runs.

**Inputs:**

| Input | Type | Default | Description |
|---|---|---|---|
| `node-version` | `string` | `'20'` | Node.js version to use |

**Outputs:**

| Output | Description |
|---|---|
| `cache-key` | Cache key for `iam-js/node_modules`, passed to lint and test jobs |

**Cache strategy:**

1. Compute a cache key from `runner.os` + `hashFiles('iam-js/package-lock.json')`
2. Attempt to restore `iam-js/node_modules` from cache
3. Run `npm ci` **only** if cache miss
4. Run `npm run build`
5. Save `iam-js/node_modules` to cache **only** if it was a cache miss

The `node_modules` folder is always located at `iam-js/node_modules` since the Node.js application lives under `iam-js/` rather than at the repository root.

---

### `lint.yml`

Restores the `node_modules` cache produced by `install` and runs the project linter.

**Inputs:**

| Input | Type | Required | Description |
|---|---|---|---|
| `node-version` | `string` | No (`'20'`) | Node.js version to use |
| `cache-key` | `string` | Yes | Cache key received from the `install` job |

**Command:** `npm run lint` (runs from `iam-js/`)

---

### `test.yml`

Restores the `node_modules` cache produced by `install` and runs the test suite.

**Inputs:**

| Input | Type | Required | Description |
|---|---|---|---|
| `node-version` | `string` | No (`'20'`) | Node.js version to use |
| `cache-key` | `string` | Yes | Cache key received from the `install` job |

**Command:** `npm test` (runs from `iam-js/`)

---

## Project structure

The Node.js application is not at the repository root. All workflow steps that execute shell commands use `defaults.run.working-directory: iam-js`. Steps using `uses:` (actions) always operate relative to the repository root, so paths like `iam-js/node_modules` and `iam-js/package-lock.json` are used explicitly in those contexts.

```
root/
├── iam-js/
│   ├── package.json
│   ├── package-lock.json
│   ├── node_modules/       ← cached across CI runs
│   └── ...
└── .github/
    └── workflows/
        ├── ci.yml
        ├── install.yml
        ├── lint.yml
        └── test.yml
```

---

## Environment variables

No secrets or environment variables need to be configured manually. The following are injected automatically by the GitHub Actions runner:

| Variable | Purpose |
|---|---|
| `$GITHUB_OUTPUT` | Passes output values between steps |
| `$RUNNER_OS` | Used as part of the cache key |
| `$GITHUB_SHA`, `$GITHUB_REF`, etc. | Standard GitHub context variables |

---

## Adding a new workflow

1. Create `.github/workflows/<name>.yml` with `on: workflow_call`
2. Accept `node-version` and `cache-key` as inputs
3. Restore `iam-js/node_modules` using `actions/cache/restore@v4` with `fail-on-cache-miss: true`
4. Set `defaults.run.working-directory: iam-js`
5. Call it from `ci.yml` with `needs: install` and pass `cache-key: ${{ needs.install.outputs.cache-key }}`