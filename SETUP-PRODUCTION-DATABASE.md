# Setting Up Production (Remote) Database

## Step 1: Create Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Click **"Get started"** on the "Edit Cloudflare Workers" template
4. Under **"Permissions"**, add:
   - **Account** → **Cloudflare D1** → **Edit**
5. Click **"Continue to summary"**
6. Click **"Create Token"**
7. **Copy the token immediately** (you won't be able to see it again!)

## Step 2: Set the API Token (Choose One Method)

### Option A: Temporary (Current Session Only)
**Windows PowerShell:**
```powershell
$env:CLOUDFLARE_API_TOKEN="your-token-here"
```

**Windows Command Prompt:**
```cmd
set CLOUDFLARE_API_TOKEN=your-token-here
```

### Option B: Permanent (Recommended)
**Windows PowerShell (Run as Administrator):**
```powershell
[System.Environment]::SetEnvironmentVariable('CLOUDFLARE_API_TOKEN', 'your-token-here', 'User')
```

After setting permanently, **restart your terminal/IDE** for it to take effect.

### Option C: Use .env file (Alternative)
Create a `.env` file in your project root:
```
CLOUDFLARE_API_TOKEN=your-token-here
```

**Note:** Add `.env` to your `.gitignore` to keep your token secure!

## Step 3: Verify Token Works

Test that your token is set correctly:

```bash
npx wrangler d1 list
```

If it works, you'll see your databases listed. If you get an authentication error, check your token.

## Step 4: Set Up Remote Database Schema

First, create the schema on the remote database:

```bash
npx wrangler d1 execute alpine-advisor-db --file=./schema.sql --remote
npx wrangler d1 execute alpine-advisor-db --file=./seed-attributes.sql --remote
```

## Step 5: Migrate Your Local Data to Production

### Option A: Export and Import Everything (Full Migration)

```bash
# Export local database
npx wrangler d1 export alpine-advisor-db --output=./export-database.sql

# Import to remote
npx wrangler d1 execute alpine-advisor-db --file=./export-database.sql --remote
```

### Option B: Use Your JSON Script (Recommended for Updates)

You can modify the script to support remote, or just run individual commands:

```bash
# For now, you'll need to manually run SQL or modify the script
# We can add a --remote flag option to the script if needed
```

## Step 6: Verify Remote Database

Check that data is in the remote database:

```bash
npx wrangler d1 execute alpine-advisor-db --command="SELECT COUNT(*) as total FROM Tbl_Skis;" --remote
```

## Important Notes:

- **Local vs Remote are separate**: Changes to local don't affect remote automatically
- **Always use `--remote` flag**: Without it, commands run on local database
- **Schema first**: Always run schema.sql before importing data
- **Keep token secure**: Never commit your API token to git

## Quick Reference Commands:

```bash
# List databases
npx wrangler d1 list

# Execute SQL on remote
npx wrangler d1 execute alpine-advisor-db --file=./your-file.sql --remote

# Execute SQL command on remote
npx wrangler d1 execute alpine-advisor-db --command="SELECT * FROM Tbl_Skis;" --remote

# Export remote database
npx wrangler d1 export alpine-advisor-db --output=./remote-export.sql --remote
```


