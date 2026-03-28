# IAMJs

![lint](https://github.com/GuillaumeLaurin/IAMJs/actions/workflows/lint.yml/badge.svg?branch=main)
![test](https://github.com/GuillaumeLaurin/IAMJs/actions/workflows/test.yml/badge.svg?branch=main)

Identity & Access Management (IAM) — Built with NestJS, featuring JWT auth, RBAC, OAuth2, and full user lifecycle management.

## Dependencies

| Dependency | Level |
|---|---|
| `Docker` | Recommended |
| `Chocolatey` or `Scoop` | optional |
| `Make` | optional |

## How to download Make

### 1. Windows

Open a terminal as admin and run the following command :

With Chocolatey

```bash
choco install make
```

Or with Scoop

```bash
scoop install make
```

### 2. Linux

Make should be installed by default

## How to run with Docker

### 1. Clone the repository

#### HTTPS

```bash
git clone https://github.com/GuillaumeLaurin/IAMJs.git
cd IAMJS
```

#### SSH

```bash
git clone git@github.com:GuillaumeLaurin/IAMJs.git
cd IAMJS
```

### 2. Initialize Client `node_modules`

```bash
cd client
npm ci
```

### 3. Intialize Backend `node_modules`

```bash
cd iam-js
npm ci
```

### 4. Create your environment file

Create a `.env` file under iam-js folder:

```properties
POSTGRES_HOST = localhost
POSTGRES_PORT = 5432
POSTGRES_USERNAME = postgres
POSTGRES_PASSWORD = postgres
POSTGRES_DATABASE = postdb
POSTGRES_DB = postdb

PORT = 3000

REDIS_HOST = localhost
REDIS_PORT = 6379
REDIS_PASSWORD = redis
REDIS_DB = 0

JWT_ACCESS_SECRET = pReZHilCwPTHs39FdHmWpE8WW6br4TPnocYLqvPqbKsriVtLlhiyDYN5Id7lAAm3jTgP2NJdtLUpp6xG9JXEo9
JWT_REFRESH_SECRET = OePJLmlBgCyt6xWyIf97df7JyFAPPMY3E1u7v7LX7t84AlwY4uhBa2GHkqQK0xnxdUNjLpO4uwPLyiocJhBuzz

NODE_ENV = development

GITHUB_CLIENT_ID = xxx
GITHUB_CLIENT_SECRET = xxx
GITHUB_CALLBACK_URL = http://localhost:3000/api/auth/github/callback

GOOGLE_CLIENT_ID = xxx
GOOGLE_CLIENT_SECRET = xxx
GOOGLE_CALLBACK_URL = http://localhost:3000/api/auth/google/callback

CLIENT_URL = http://localhost:4200
```

> See `.env.example` for reference.

### 5. Start the application

```bash
make up
```

The API will be available at **http://localhost:3000**.
The Application will be available at **http://localhost:4200**

---

For more Docker commands, see [DOCKER.md](./DOCKER.md).