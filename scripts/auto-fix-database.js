// Auto-fix database schema via Supabase API
const SUPABASE_PROJECT_REF = 'zoqqhldmxbuwfbmtfvcs'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcXFobGRteGJ1d2ZibXRmdmNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI2NDYyOSwiZXhwIjoyMDczODQwNjI5fQ.154jk1UDZz-LOIdqCLV7gfjJHamQmgGXrt6x_jjltJo'

async function executeSQL(sql) {
  console.log(`🔧 Executing: ${sql}`)
  
  try {
    // Use Supabase Management API for SQL execution
    const response = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({
        query: sql
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log(`✅ Success: ${sql}`)
      return { success: true, result }
    } else {
      const error = await response.text()
      console.log(`⚠️  API failed, trying direct connection...`)
      
      // Fallback: Try direct PostgreSQL connection via REST API
      const directResponse = await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY
        },
        body: JSON.stringify({ query: sql })
      })

      if (directResponse.ok) {
        console.log(`✅ Success via direct API: ${sql}`)
        return { success: true, result: await directResponse.json() }
      } else {
        console.log(`❌ Failed: ${sql} - ${error}`)
        return { success: false, error }
      }
    }
  } catch (error) {
    console.log(`❌ Error: ${sql} - ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function fixClientProfileSchema() {
  console.log('🚀 Auto-fixing ClientProfile schema...\n')
  
  const sqlCommands = [
    // Add missing columns
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "website" TEXT;`,
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "companySize" TEXT;`,
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "location" TEXT;`,
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "phone" TEXT;`,
    
    // Add performance indexes
    `CREATE INDEX IF NOT EXISTS "ClientProfile_industry_idx" ON "ClientProfile"("industry");`,
    `CREATE INDEX IF NOT EXISTS "ClientProfile_companySize_idx" ON "ClientProfile"("companySize");`,
    `CREATE INDEX IF NOT EXISTS "ClientProfile_location_idx" ON "ClientProfile"("location");`,
    
    // Fix existing data
    `UPDATE "ClientProfile" SET "description" = COALESCE("description", '') WHERE "description" IS NULL;`
  ]

  let successCount = 0
  let failCount = 0

  for (const sql of sqlCommands) {
    const result = await executeSQL(sql)
    if (result.success) {
      successCount++
    } else {
      failCount++
    }
  }

  console.log(`\n📊 Results: ${successCount} successful, ${failCount} failed`)
  
  // Verify schema
  const verifyResult = await executeSQL(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'ClientProfile' 
    AND table_schema = 'public'
    ORDER BY ordinal_position;
  `)

  if (verifyResult.success) {
    console.log('\n📋 Updated ClientProfile schema:')
    console.table(verifyResult.result)
  }

  return successCount > 0
}

async function main() {
  console.log('🎯 Auto-fixing database schema issues...\n')
  
  const success = await fixClientProfileSchema()
  
  if (success) {
    console.log('\n🎉 Database schema updated successfully!')
    console.log('\n🔄 Next: Regenerating Prisma client...')
    
    // Auto-regenerate Prisma client
    const { spawn } = require('child_process')
    const prismaGenerate = spawn('npm', ['run', 'db:generate'], { 
      stdio: 'inherit',
      shell: true 
    })

    prismaGenerate.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Prisma client regenerated!')
        console.log('\n🚀 Ready to test client profile setup!')
      } else {
        console.log('\n❌ Prisma generation failed. Run manually: npm run db:generate')
      }
    })
  } else {
    console.log('\n❌ Database update failed. Manual intervention required.')
  }
}

main().catch(console.error)
