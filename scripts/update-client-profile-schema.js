// Update ClientProfile table schema via Supabase API
const SUPABASE_PROJECT_REF = 'zoqqhldmxbuwfbmtfvcs'
const SUPABASE_API_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/`

// You'll need to get your Supabase service role key from the dashboard
// For security, this should be in environment variables
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

async function updateClientProfileSchema() {
  console.log('🔧 Updating ClientProfile table schema...')
  
  const sqlCommands = [
    // Add new columns to ClientProfile table
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "website" TEXT;`,
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "companySize" TEXT;`,
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "location" TEXT;`,
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "phone" TEXT;`,
    
    // Add indexes for better performance
    `CREATE INDEX IF NOT EXISTS "ClientProfile_industry_idx" ON "ClientProfile"("industry");`,
    `CREATE INDEX IF NOT EXISTS "ClientProfile_companySize_idx" ON "ClientProfile"("companySize");`,
    `CREATE INDEX IF NOT EXISTS "ClientProfile_location_idx" ON "ClientProfile"("location");`,
    
    // Update existing records
    `UPDATE "ClientProfile" SET "description" = COALESCE("description", '') WHERE "description" IS NULL;`
  ]

  try {
    // Execute each SQL command
    for (const sql of sqlCommands) {
      console.log(`Executing: ${sql}`)
      
      const response = await fetch(`${SUPABASE_API_URL}rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY
        },
        body: JSON.stringify({
          query: sql
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error(`❌ Failed to execute SQL: ${sql}`)
        console.error(`Error: ${error}`)
        return false
      }

      console.log(`✅ Success: ${sql}`)
    }

    // Verify the schema update
    console.log('\n🔍 Verifying schema update...')
    const verifyResponse = await fetch(`${SUPABASE_API_URL}rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'ClientProfile' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      })
    })

    if (verifyResponse.ok) {
      const result = await verifyResponse.json()
      console.log('\n📋 Updated ClientProfile schema:')
      console.table(result)
    }

    console.log('\n🎉 ClientProfile schema updated successfully!')
    return true

  } catch (error) {
    console.error('❌ Error updating schema:', error)
    return false
  }
}

// Alternative: Use the Management API for SQL execution
async function updateSchemaViaManagementAPI() {
  console.log('🔧 Using Supabase Management API...')
  
  // This requires a personal access token from Supabase dashboard
  const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
  const PROJECT_ID = SUPABASE_PROJECT_REF

  const sql = `
    -- Add new columns to ClientProfile table
    ALTER TABLE "ClientProfile" 
    ADD COLUMN IF NOT EXISTS "website" TEXT,
    ADD COLUMN IF NOT EXISTS "companySize" TEXT,
    ADD COLUMN IF NOT EXISTS "location" TEXT,
    ADD COLUMN IF NOT EXISTS "phone" TEXT;

    -- Add indexes for better performance
    CREATE INDEX IF NOT EXISTS "ClientProfile_industry_idx" ON "ClientProfile"("industry");
    CREATE INDEX IF NOT EXISTS "ClientProfile_companySize_idx" ON "ClientProfile"("companySize");
    CREATE INDEX IF NOT EXISTS "ClientProfile_location_idx" ON "ClientProfile"("location");

    -- Update existing records
    UPDATE "ClientProfile" 
    SET "description" = COALESCE("description", '')
    WHERE "description" IS NULL;
  `

  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        query: sql
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Schema updated via Management API!')
      console.log(result)
      return true
    } else {
      const error = await response.text()
      console.error('❌ Management API error:', error)
      return false
    }

  } catch (error) {
    console.error('❌ Error with Management API:', error)
    return false
  }
}

// Run the schema update
async function main() {
  console.log('🚀 Starting ClientProfile schema update...\n')
  
  // Check if we have the required environment variables
  if (!process.env.SUPABASE_SERVICE_KEY && !process.env.SUPABASE_ACCESS_TOKEN) {
    console.log('⚠️  Missing environment variables!')
    console.log('Please add one of the following to your .env.local:')
    console.log('SUPABASE_SERVICE_KEY=your_service_role_key')
    console.log('or')
    console.log('SUPABASE_ACCESS_TOKEN=your_personal_access_token')
    console.log('\nGet these from your Supabase dashboard:')
    console.log('- Service Key: Project Settings > API > service_role key')
    console.log('- Access Token: Account Settings > Access Tokens')
    return
  }

  let success = false

  // Try Management API first (if token available)
  if (process.env.SUPABASE_ACCESS_TOKEN) {
    success = await updateSchemaViaManagementAPI()
  }

  // Fallback to direct API (if service key available)
  if (!success && process.env.SUPABASE_SERVICE_KEY) {
    success = await updateClientProfileSchema()
  }

  if (success) {
    console.log('\n🎯 Next steps:')
    console.log('1. Run: npm run db:generate')
    console.log('2. Test the client profile setup flow')
    console.log('3. Continue with Expert Profile implementation')
  }
}

main().catch(console.error)
