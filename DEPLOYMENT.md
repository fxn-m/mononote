# Deployment Guide

This application is configured for deployment on Render.com.

## Prerequisites

- A Render.com account
- No database required - the app uses localStorage on the client side

## Deployment Steps

### 1. Connect Your Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub/GitLab repository
4. Select this repository

### 2. Configure the Service

Render will automatically detect the `render.yaml` file, but you can also configure manually:

- **Name**: mononote (or your preferred name)
- **Environment**: Node
- **Build Command**: `pnpm run build`
- **Start Command**: `pnpm run start`
- **Plan**: Choose your preferred plan (Free tier available)

### 3. Environment Variables

Add the following environment variables in the Render dashboard:

- `NODE_ENV`: `production`
- `PORT`: Automatically set by Render (no need to set manually)

**Note**: No database configuration needed! The app uses browser localStorage for data persistence.

### 5. Deploy

Click "Create Web Service" and Render will:
1. Install dependencies (pnpm will be used automatically if `pnpm-lock.yaml` is present)
2. Run the build command (`pnpm run build`)
3. Start the service with `pnpm run start`

## Build Process

The build process:
1. **Frontend**: Vite builds the React app to `dist/public`
2. **Backend**: esbuild bundles the Express server to `dist/index.js`
3. **Production**: The server serves static files from `dist/public` (no API routes needed - data is stored in browser localStorage)

## Health Check

The service includes a health check endpoint at `/` that Render uses to verify the service is running.

## Manual Deployment

You can also deploy manually:

```bash
# Build the application
pnpm run build

# Start in production mode
NODE_ENV=production PORT=3000 pnpm run start
```

## Troubleshooting

- **Build fails**: Check that all dependencies are listed in `package.json`
- **Static files not found**: Ensure `pnpm run build` completed successfully
- **Port errors**: Render automatically sets `PORT`, don't override it
- **Data not persisting**: Notes are stored in browser localStorage, so data is per-browser/device

## Alternative Platforms

This application can also be deployed on:
- **Railway**: Similar setup, uses `railway.toml` or manual configuration
- **Fly.io**: Requires `fly.toml` configuration
- **Heroku**: Requires `Procfile` with `web: pnpm start`

