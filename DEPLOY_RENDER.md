# Deploy ExcellenceOS on Render

This app deploys as three pieces:

1. MySQL private service on Render
2. Node API web service from `server`
3. React static site from `client`

## 1. Create MySQL on Render

Render's MySQL setup runs as a private Docker service with a persistent disk.

- Follow Render's MySQL guide: https://render.com/docs/deploy-mysql
- Use database name: `excellenceos`
- Use any secure MySQL username/password.
- Add a disk mounted at `/var/lib/mysql`.

After it is live, copy the internal host shown by Render. It looks like:

```text
mysql-xxxx:3306
```

Use the part before `:3306` as `MYSQL_HOST`.

## 2. Deploy the API

Create a Render Blueprint from this repository's `render.yaml`, or create a Web Service manually:

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

Set these environment variables in Render:

```env
MYSQL_HOST=<render-mysql-private-host>
MYSQL_PORT=3306
MYSQL_USER=<render-mysql-user>
MYSQL_PASSWORD=<render-mysql-password>
MYSQL_DATABASE=excellenceos
JWT_SECRET=<secure-random-secret>
GEMINI_API_KEY=<optional>
```

The API creates its tables automatically on startup.

## 3. Deploy the Client

Create the Static Site from the same repo:

- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Rewrite Rule: `/*` to `/index.html`

Set this environment variable:

```env
VITE_API_URL=https://<your-api-service>.onrender.com
```

After changing `VITE_API_URL`, redeploy the static site so Vite bakes the API URL into the build.
