# App Chat Nest

## Setup

Prerequis:
- Node.js 20+
- pnpm 10+
- Docker Desktop demarre

A la racine du projet:

~~~bash
make setup
~~~

Cette commande:
- cree apps/api/.env depuis apps/api/.env.example (si absent)
- lance PostgreSQL avec Docker
- initialise Prisma (generate + migrate + seed)

## Lancer le projet

~~~bash
pnpm dev
~~~

Ou:

~~~bash
make dev
~~~

## Compte de connexion seed

~~~text
email: admin@orus.com
mot de passe: admin
~~~

## URLs

- Web: http://localhost:3000
- API: http://localhost:3001
- Swagger: http://localhost:3001/api
