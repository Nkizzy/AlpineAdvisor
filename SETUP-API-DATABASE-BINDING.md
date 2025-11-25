# Setting Up D1 Database Binding for Cloudflare Pages

The API endpoint requires the D1 database to be bound in your Cloudflare Pages project. Follow these steps:

## Step 1: Go to Cloudflare Dashboard

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click on your **Pages** project (e.g., `alpine-advisor`)

## Step 2: Configure Database Binding

1. In your Pages project, go to **Settings** (in the top navigation)
2. Click on **Functions** in the left sidebar
3. Scroll down to **D1 Database Bindings**
4. Click **Add binding**

## Step 3: Configure the Binding

Fill in the form:
- **Variable name**: `DB` (must match exactly - case sensitive)
- **D1 Database**: Select `alpine-advisor-db` from the dropdown
- Click **Save**

## Step 4: Redeploy

After saving the binding:
1. Go to **Deployments** tab
2. Click the **...** menu on your latest deployment
3. Click **Retry deployment** (or push a new commit to trigger a new deployment)

## Verification

After redeploying, the API endpoint at `/api/recommendations` should work. You can test it by:
1. Taking the quiz on your website
2. Checking the browser console for any errors
3. The API should now successfully query the database

## Troubleshooting

- **"Database not configured" error**: The binding variable name must be exactly `DB` (not `db` or `database`)
- **"Failed to fetch recommendations"**: Check Cloudflare Pages logs in the dashboard to see detailed error messages
- **Still not working**: Make sure you've redeployed after adding the binding

## Local Development

For local development, the binding is configured in `wrangler.toml`. You can test locally with:
```bash
npm run dev
```

Then the API will use your local D1 database.

