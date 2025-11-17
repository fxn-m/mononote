# Deployment Guide

This application is configured for deployment on Render.com.

## Prerequisites

- A Render.com account
- A PostgreSQL database (can be provisioned through Render or use Neon, Supabase, etc.)
- Your database connection string

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
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Plan**: Choose your preferred plan (Free tier available)

### 3. Environment Variables

Add the following environment variables in the Render dashboard:

- `NODE_ENV`: `production`
- `DATABASE_URL`: Your PostgreSQL connection string
- `PORT`: Automatically set by Render (no need to set manually)

If you're using session management or authentication, you may also need:
- `SESSION_SECRET`: A random secret string for session encryption

### 4. Database Setup

If you haven't set up a database yet:

1. Create a PostgreSQL database on Render (or use Neon/Supabase)
2. Get the connection string
3. Add it as `DATABASE_URL` environment variable
4. Run migrations: `npm run db:push` (you can do this locally or via Render shell)

### 5. Deploy

Click "Create Web Service" and Render will:
1. Install dependencies
2. Run the build command (`npm run build`)
3. Start the service with `npm run start`

## Build Process

The build process:
1. **Frontend**: Vite builds the React app to `dist/public`
2. **Backend**: esbuild bundles the Express server to `dist/index.js`
3. **Production**: The server serves static files from `dist/public` and handles API routes

## Health Check

The service includes a health check endpoint at `/` that Render uses to verify the service is running.

## Manual Deployment

You can also deploy manually:

```bash
# Build the application
npm run build

# Start in production mode
NODE_ENV=production PORT=3000 npm run start
```

## Troubleshooting

- **Build fails**: Check that all dependencies are listed in `package.json`
- **Static files not found**: Ensure `npm run build` completed successfully
- **Database connection errors**: Verify `DATABASE_URL` is set correctly
- **Port errors**: Render automatically sets `PORT`, don't override it

## Alternative Platforms

This application can also be deployed on:
- **Railway**: Similar setup, uses `railway.toml` or manual configuration
- **Fly.io**: Requires `fly.toml` configuration
- **Heroku**: Requires `Procfile` with `web: npm start`

