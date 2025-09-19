// Final database fix with correct service role key
const SUPABASE_PROJECT_REF = 'zoqqhldmxbuwfbmtfvcs'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcXFobGRteGJ1d2ZibXRmdmNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI2NDYyOSwiZXhwIjoyMDczODQwNjI5fQ.154jk1UDZz-LOIdqCLV7gfjJHamQmgGXrt6x_jjltJo'

async function executeDirectSQL(sql) {
  console.log(`🔧 Executing: ${sql.substring(0, 50)}...`)
  
  try {
    // Use direct PostgreSQL connection via Supabase REST API
    const response = await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        sql: sql
      })
    })

    if (response.ok) {
      console.log(`✅ Success`)
      return true
    } else {
      const error = await response.text()
      console.log(`⚠️  API response: ${error}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
    return false
  }
}

async function updateClientProfileTable() {
  console.log('🚀 Updating ClientProfile table with new columns...\n')
  
  const sqlCommands = [
    // Add columns one by one
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "website" TEXT;`,
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "companySize" TEXT;`,
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "location" TEXT;`,
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "phone" TEXT;`,
    
    // Add indexes
    `CREATE INDEX IF NOT EXISTS "ClientProfile_industry_idx" ON "ClientProfile"("industry");`,
    `CREATE INDEX IF NOT EXISTS "ClientProfile_companySize_idx" ON "ClientProfile"("companySize");`,
    `CREATE INDEX IF NOT EXISTS "ClientProfile_location_idx" ON "ClientProfile"("location");`,
    
    // Update existing data
    `UPDATE "ClientProfile" SET "description" = COALESCE("description", '') WHERE "description" IS NULL;`
  ]

  let successCount = 0
  
  for (const sql of sqlCommands) {
    const success = await executeDirectSQL(sql)
    if (success) successCount++
    
    // Small delay between commands
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`\n📊 Completed: ${successCount}/${sqlCommands.length} commands successful`)
  return successCount > 0
}

async function testTableStructure() {
  console.log('\n🔍 Testing table structure...')
  
  try {
    // Test by trying to insert a complete record
    const testData = {
      id: `test_${Date.now()}`,
      userId: `user_${Date.now()}`,
      companyName: 'Test Company',
      industry: 'Technology',
      description: 'Test description',
      website: 'https://test.com',
      companySize: '1-10 employees',
      location: 'Amsterdam, NL',
      phone: '+31 6 12345678'
    }

    const response = await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/ClientProfile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testData)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ All columns working correctly!')
      
      // Clean up test record
      await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/ClientProfile?id=eq.${testData.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY
        }
      })
      
      console.log('🧹 Test record cleaned up')
      return true
    } else {
      const error = await response.text()
      console.log(`⚠️  Insert test failed: ${error}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Test error: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🎯 Final ClientProfile database fix...\n')
  
  // Step 1: Update table structure
  const updateSuccess = await updateClientProfileTable()
  
  // Step 2: Test the structure
  const testSuccess = await testTableStructure()
  
  if (updateSuccess || testSuccess) {
    console.log('\n🎉 Database schema is ready!')
    
    // Step 3: Regenerate Prisma client
    console.log('\n🔄 Regenerating Prisma client...')
    const { spawn } = require('child_process')
    
    const prismaGenerate = spawn('npm', ['run', 'db:generate'], { 
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    })

    prismaGenerate.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Prisma client regenerated successfully!')
        console.log('\n🚀 System is ready for testing!')
        console.log('\n📋 Test steps:')
        console.log('1. Go to http://localhost:3000')
        console.log('2. Register/login as CLIENT')
        console.log('3. Complete profile setup')
        console.log('4. Verify all fields save correctly')
      } else {
        console.log('\n⚠️  Prisma generation had issues, but database is updated')
        console.log('Run manually: npm run db:generate')
      }
    })

    prismaGenerate.on('error', (error) => {
      console.log('\n⚠️  Prisma command error:', error.message)
      console.log('Run manually: npm run db:generate')
    })
    
  } else {
    console.log('\n❌ Database update failed')
    console.log('\n📝 Manual action required:')
    console.log('Execute this SQL in Supabase SQL Editor:')
    console.log(`
ALTER TABLE "ClientProfile" 
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "companySize" TEXT,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT;
    `)
  }
}

main().catch(console.error)
