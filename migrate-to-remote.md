# How to Migrate Local Database to Cloudflare Remote

## Step 1: Export Your Local Database

Export all data from your local database to a SQL file:

```bash
npx wrangler d1 export alpine-advisor-db --output=./export-database.sql
```

This creates a file with all your tables, data, and structure.

## Step 2: Set Up Cloudflare API Token (One-time setup)

1. Go to: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Add permissions for "Account > Cloudflare D1 > Edit"
5. Copy the token

## Step 3: Set the Token as Environment Variable

**Windows PowerShell:**
```powershell
$env:CLOUDFLARE_API_TOKEN="your-token-here"
```

**Windows Command Prompt:**
```cmd
set CLOUDFLARE_API_TOKEN=your-token-here
```

**For permanent setup (PowerShell):**
```powershell
[System.Environment]::SetEnvironmentVariable('CLOUDFLARE_API_TOKEN', 'your-token-here', 'User')
```

## Step 4: Import to Remote Database

First, make sure the remote database has the schema:

```bash
npx wrangler d1 execute alpine-advisor-db --file=./schema.sql --remote
npx wrangler d1 execute alpine-advisor-db --file=./seed-attributes.sql --remote
```

Then import all your data:

```bash
npx wrangler d1 execute alpine-advisor-db --file=./export-database.sql --remote
```

## Alternative: Direct SQL Execution

If you prefer, you can run individual SQL files directly on remote:

```bash
npx wrangler d1 execute alpine-advisor-db --file=./seed-skis-example.sql --remote
```

## Important Notes:

- **Remote database is separate**: Your local and remote databases are independent
- **Schema must exist first**: Always run schema.sql before importing data
- **Attributes are already there**: The seed-attributes.sql only needs to run once
- **Incremental updates**: You can add new data files and run them on remote individually

