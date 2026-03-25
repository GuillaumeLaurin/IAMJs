# IAMJs
Identity & Access Management (IAM) — Built with NestJS, featuring JWT auth, RBAC, OAuth2, and full user lifecycle management.

## Dependencies

- Docker / Docker Desktop

## How to run with Docker

### 1. Clone the repository

#### HTTPS

```bash
git clone https://github.com/GuillaumeLaurin/IAMJs.git
cd IAMJS/iam-js
```

#### SSH

```bash
git clone git@github.com:GuillaumeLaurin/IAMJs.git
cd IAMJS/iam-js
```

### 2. Create your environment file

Create a `.env` file at the root of the project:

```properties
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=postdb
POSTGRES_DB=postdb
PORT=3000
```

> See `.env.example` for reference.

### 3. Start the application

```bash
docker compose up --build
```

The API will be available at **http://localhost:3000**.

---

For more Docker commands, see [DOCKER.md](./DOCKER.md).