# Next.js + PostgreSQL launch board

A small, read-only launch board for learning to deploy an application and its database on Helicarrier. The page reads fictional launch records from PostgreSQL on every request. It has no public write endpoint, login, third-party analytics, or production data.

Verified on Helicarrier on 21 October 2026 (Africa/Lagos): the GitHub-backed image deployed, its release migration succeeded, `/health` returned HTTP 200 with `{"ok":true}`, and the page read all four PostgreSQL records. A second release of the same commit retained exactly four records. The disposable app and database were removed afterward. The accompanying screenshot guide is prepared for publication review; the example repository is still private pending that review.

## Run locally

Requires Node.js 22, npm, and Docker with Compose. The dependency versions are pinned in `package-lock.json`.

```sh
npm ci
docker compose up -d --wait postgres
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`. You should see “PostgreSQL connected” and four sample records. `/health` returns `{"ok":true}` only when the database and application table are available; it returns HTTP 503 otherwise.

The database is bound to `127.0.0.1:15439`. Its example password is deliberately only for disposable local use. Never copy it to a remote database. Next.js loads `.env.local` for the application; the migration command loads it explicitly. The file is ignored by Git and Docker.

## Deployment settings verified on Helicarrier

Deploy from a GitHub repository containing this directory. When using this monorepo, set the service root directory to `examples/nextjs-postgres`; a standalone example repository would use its root. Use the included Dockerfile.

| Setting | Value |
| --- | --- |
| Service type | Web service |
| Internal port | `3000` |
| Automatic health checks | `/health`, every 30 seconds, 3 failures before restart |
| Release command | `npm run db:migrate` |
| Database reference | PostgreSQL internal connection URL → `DATABASE_URL` |
| Start command | Leave blank; the image starts `node server.js` |

Create PostgreSQL in the same project/environment. Keep external access off for the application connection. Use a service reference rather than copying a connection string into source code. `DATABASE_URL` is read by server code at runtime; never rename it to a `NEXT_PUBLIC_` variable. No database credentials are required by `npm run build` or `docker build`.

For the dashboard walkthrough, first create the app without a release command and apply the staged creation. An initial “Setup needed” page is expected. Add the private reference under Variables & secrets, set the release command in Service settings, then save and redeploy. This applies the connection and migration together. Enable the HTTP health check after the application is ready.

Select and review the app and database plans before creating resources. The standard catalog lists a 512 MB app at $3/month and a 512 MB PostgreSQL service with 2 GB storage at $3.50/month, before optional backups and other charges. These are full-month reference rates, not a quoted total for a walkthrough; confirm the account's current rates in the dashboard. Build resource usage and production sizing need to be measured separately.

## How the release works

`migrations/001_launch_board.sql` creates the application table and inserts four fictional records. The release command applies unrecorded migrations in a transaction and records them in `guide_migrations`. An advisory lock serializes overlapping releases. Re-running the command does not insert duplicate records.

The Dockerfile builds a standalone Next.js server and runs it as the non-root `node` user. It includes the migration files and command. The application uses a small connection pool and does not write uploads or caches to its filesystem. The CI check exercises the image with a read-only root filesystem and writable temporary directories.

This small migration runner demonstrates the release sequence. It does not replace a full migration tool's versioning, rollback, or drift-detection features. Keep applied migrations unchanged and add a new file for each schema change. App rollback does not undo data changes.

## Verify

```sh
TEST_DATABASE_URL=postgresql://guide:local-demo-only@127.0.0.1:15439/helicarrier_guide npm run test:db
npm run build
```

The database test permits only the explicitly named local guide database. It checks overlapping migrations, repeat execution, and seed preservation. GitHub's “Verify SEO tutorial example” workflow also builds the Docker image, runs its release command, and verifies its page and health endpoint against disposable PostgreSQL.

If the page says “Setup needed,” confirm the database is running, apply the reference to the app, and run the migration. A successful image build alone does not establish a working database connection. Keep connection strings and credentials out of logs, screenshots, and support messages.

## Clean up

For the disposable local database:

```sh
docker compose down --volumes
```

This removes its local sample data. For a Helicarrier walkthrough, remove only the demo app/database resources created for it, after confirming the screenshots and results. Check the dashboard for remaining billable resources.

References: [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting), [node-postgres pooling](https://node-postgres.com/features/pooling), [Helicarrier build settings](https://helicarrier.cloud/docs/deploying/build-and-runtime/), [service references](https://helicarrier.cloud/docs/networking/references/).
