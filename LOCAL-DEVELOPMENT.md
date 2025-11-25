# Local Development Guide

## The Issue

Cloudflare Pages Functions (like `/api/recommendations`) only run on Cloudflare's infrastructure, not in standard Vite development mode. This means when you run `npm run dev`, the API endpoint won't work.

## Solution: Use Wrangler Pages Dev

To test the full application locally (including the API), use Wrangler's development server:

### Option 1: Build + Dev (Recommended)

```bash
npm run dev:build
```

This will:
1. Build your React app
2. Start Wrangler Pages dev server with Functions support
3. Serve your app with working API endpoints

### Option 2: Manual Steps

```bash
# 1. Build the app
npm run build

# 2. Start Wrangler Pages dev server
npm run dev:full
```

## Testing Without API (Frontend Only)

If you just want to test the UI without the API:

```bash
npm run dev
```

The quiz will work, but the results page will show an error. This is fine for testing UI changes.

## Production Testing

For full end-to-end testing, test on your deployed Cloudflare Pages site where the API will work properly.

## Troubleshooting

- **"API not available"**: You're using `npm run dev` - switch to `npm run dev:build`
- **Port conflicts**: Wrangler uses port 8788 by default, Vite uses 8080
- **Database errors**: Make sure your local D1 database has data (`npm run add-skis:local`)

