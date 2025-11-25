#!/usr/bin/env node

/**
 * Script to add ski products to the database from a JSON file
 * Usage: 
 *   node add-skis-from-json.js              # Add to local database only
 *   node add-skis-from-json.js --remote     # Add to production database only
 *   node add-skis-from-json.js --both       # Add to both local and production
 */

import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';

// Parse command line arguments
const args = process.argv.slice(2);
const isRemote = args.includes('--remote');
const isBoth = args.includes('--both');

// Attribute mapping from friendly names to Attribute_IDs
const ATTRIBUTE_MAP = {
  'Skill_Level': {
    'Beginner': 1,
    'Intermediate': 2,
    'Advanced': 3,
    'Expert': 4
  },
  'Terrain': {
    'All-Mountain': 5,
    'On-Piste': 6,
    'Powder': 7,
    'Park / Freestyle': 8
  },
  'Flex_Profile': {
    'Playful / Soft': 9,
    'Stiff / Damp': 10,
    'Buttery / Jib': 11,
    'Stiff / Jumps': 12,
    'Medium / Forgiving': 13
  },
  'Turn_Style': {
    'Short & Quick': 14,
    'Long & Fast': 15
  },
  'Ski_Feature': {
    'True Twin': 16,
    'Directional Twin': 17
  }
};

function escapeSQL(str) {
  if (!str) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function generateSQL(skis) {
  const sqlStatements = [];
  
  for (const ski of skis) {
    // Check if ski exists and get its ID, or insert new one
    // Use a pattern that updates if exists, inserts if not
    const skiIdentifier = `Brand = ${escapeSQL(ski.brand)} AND Model = ${escapeSQL(ski.model)} AND Year = ${ski.year}`;
    
    // First, try to update existing ski, or insert if it doesn't exist
    // SQLite doesn't have MERGE, so we use INSERT OR REPLACE with a subquery
    // But we need to preserve Ski_ID, so we'll use a different approach:
    // 1. Check if exists and get Ski_ID
    // 2. If exists: UPDATE the ski and delete old attributes
    // 3. If not exists: INSERT the ski
    
    const getSkiId = `(SELECT Ski_ID FROM Tbl_Skis WHERE ${skiIdentifier} LIMIT 1)`;
    
    // Update existing ski OR insert new one
    // We'll use a transaction-like approach: update if exists, insert if not
    const upsertSki = `
-- Update or insert ski
UPDATE Tbl_Skis 
SET Gender = ${escapeSQL(ski.gender)}, 
    Waist_Width = ${ski.waistWidth}, 
    MSRP = ${ski.msrp}, 
    Image_URL = ${escapeSQL(ski.imageUrl)}
WHERE ${skiIdentifier};

-- If no rows were updated, insert new ski
INSERT INTO Tbl_Skis (Brand, Model, Year, Gender, Waist_Width, MSRP, Image_URL)
SELECT ${escapeSQL(ski.brand)}, ${escapeSQL(ski.model)}, ${ski.year}, ${escapeSQL(ski.gender)}, ${ski.waistWidth}, ${ski.msrp}, ${escapeSQL(ski.imageUrl)}
WHERE NOT EXISTS (SELECT 1 FROM Tbl_Skis WHERE ${skiIdentifier});`;
    
    sqlStatements.push(upsertSki);
    
    // Get the Ski_ID (will be existing or newly inserted)
    const getSkiIdForAttributes = `(SELECT Ski_ID FROM Tbl_Skis WHERE ${skiIdentifier} LIMIT 1)`;
    
    // Delete old attributes for this ski (in case we're updating)
    const deleteOldAttributes = `DELETE FROM Tbl_Ski_Attributes WHERE Ski_ID = ${getSkiIdForAttributes};`;
    sqlStatements.push(deleteOldAttributes);
    
    // Build attribute inserts
    const attributeInserts = [];
    
    // Skill Level
    if (ski.attributes.skillLevel) {
      const attrId = ATTRIBUTE_MAP['Skill_Level'][ski.attributes.skillLevel];
      if (attrId) {
        attributeInserts.push(`INSERT INTO Tbl_Ski_Attributes (Ski_ID, Attribute_ID) SELECT ${getSkiIdForAttributes}, ${attrId};`);
      }
    }
    
    // Terrain (can be multiple)
    if (ski.attributes.terrain && Array.isArray(ski.attributes.terrain)) {
      for (const terrain of ski.attributes.terrain) {
        const attrId = ATTRIBUTE_MAP['Terrain'][terrain];
        if (attrId) {
          attributeInserts.push(`INSERT INTO Tbl_Ski_Attributes (Ski_ID, Attribute_ID) SELECT ${getSkiIdForAttributes}, ${attrId};`);
        }
      }
    }
    
    // Flex Profile
    if (ski.attributes.flexProfile) {
      const attrId = ATTRIBUTE_MAP['Flex_Profile'][ski.attributes.flexProfile];
      if (attrId) {
        attributeInserts.push(`INSERT INTO Tbl_Ski_Attributes (Ski_ID, Attribute_ID) SELECT ${getSkiIdForAttributes}, ${attrId};`);
      }
    }
    
    // Turn Style
    if (ski.attributes.turnStyle) {
      const attrId = ATTRIBUTE_MAP['Turn_Style'][ski.attributes.turnStyle];
      if (attrId) {
        attributeInserts.push(`INSERT INTO Tbl_Ski_Attributes (Ski_ID, Attribute_ID) SELECT ${getSkiIdForAttributes}, ${attrId};`);
      }
    }
    
    // Ski Feature (optional, usually for park skis)
    if (ski.attributes.skiFeature) {
      const attrId = ATTRIBUTE_MAP['Ski_Feature'][ski.attributes.skiFeature];
      if (attrId) {
        attributeInserts.push(`INSERT INTO Tbl_Ski_Attributes (Ski_ID, Attribute_ID) SELECT ${getSkiIdForAttributes}, ${attrId};`);
      }
    }
    
    sqlStatements.push(...attributeInserts);
  }
  
  return sqlStatements.join('\n\n');
}

try {
  // Read the JSON file
  const jsonData = readFileSync('ski-data.json', 'utf-8');
  const parsed = JSON.parse(jsonData);
  
  // Handle both old format (array) and new format (object with 'skis' array)
  let skis;
  if (Array.isArray(parsed)) {
    skis = parsed;
  } else if (parsed.skis && Array.isArray(parsed.skis)) {
    skis = parsed.skis;
  } else {
    console.error('Error: ski-data.json must contain an array of ski objects or an object with a "skis" array');
    process.exit(1);
  }
  
  if (skis.length === 0) {
    console.error('Error: No skis found in ski-data.json');
    process.exit(1);
  }
  
  // Generate SQL
  const sql = generateSQL(skis);
  
  // Write to temporary file
  const tempFile = 'temp-add-skis.sql';
  writeFileSync(tempFile, sql);
  
  console.log(`\n📊 Found ${skis.length} ski(s) in ski-data.json\n`);
  
  // Function to execute SQL on a database
  const executeSQL = (isRemoteDB) => {
    const dbType = isRemoteDB ? 'production' : 'local';
    const remoteFlag = isRemoteDB ? ' --remote' : '';
    
    console.log(`\n🔄 Updating ${dbType} database...`);
    
    // Check for API token if remote
    if (isRemoteDB && !process.env.CLOUDFLARE_API_TOKEN) {
      console.error('\n❌ Error: CLOUDFLARE_API_TOKEN environment variable is required for production database');
      console.error('   Set it with: $env:CLOUDFLARE_API_TOKEN="your-token" (PowerShell)');
      console.error('   Or: export CLOUDFLARE_API_TOKEN="your-token" (Bash)');
      return false;
    }
    
    try {
      const command = `npx wrangler d1 execute alpine-advisor-db --file=./${tempFile}${remoteFlag}`;
      const envVars = isRemoteDB ? { ...process.env, CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN } : process.env;
      
      execSync(command, {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: envVars
      });
      
      console.log(`✅ Successfully updated ${dbType} database!`);
      return true;
    } catch (error) {
      console.error(`\n❌ Error updating ${dbType} database:`, error.message);
      return false;
    }
  };
  
  // Execute based on flags
  let success = true;
  
  if (isBoth) {
    // Update both databases
    success = executeSQL(false) && executeSQL(true);
  } else if (isRemote) {
    // Update production only
    success = executeSQL(true);
  } else {
    // Update local only (default)
    success = executeSQL(false);
  }
  
  // Clean up temp file
  try {
    unlinkSync(tempFile);
  } catch (e) {
    // Ignore cleanup errors
  }
  
  if (!success) {
    process.exit(1);
  }
  
  console.log('\n✨ All done!');
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

