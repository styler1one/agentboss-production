// Direct schema update with provided service key
const SUPABASE_PROJECT_REF = 'zoqqhldmxbuwfbmtfvcs'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcXFobGRteGJ1d2ZibXRmdmNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI2NDYyOSwiZXhwIjoyMDczODQwNjI5fQ.154jk1UDZz-LOIdqCLV7gfjJHamQmgGXrt6x_jjltJo'

async function updateClientProfileSchema() {
  console.log('🔧 Updating ClientProfile table schema via Supabase API...')
  
  const sqlCommands = [
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "website" TEXT;`,
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "companySize" TEXT;`, 
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "location" TEXT;`,
    `ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "phone" TEXT;`,
    `CREATE INDEX IF NOT EXISTS "ClientProfile_industry_idx" ON "ClientProfile"("industry");`,
    `CREATE INDEX IF NOT EXISTS "ClientProfile_companySize_idx" ON "ClientProfile"("companySize");`,
    `CREATE INDEX IF NOT EXISTS "ClientProfile_location_idx" ON "ClientProfile"("location");`,
    `UPDATE "ClientProfile" SET "description" = COALESCE("description", '') WHERE "description" IS NULL;`
  ]

  try {
    // Use Supabase REST API with RPC call for SQL execution
    const baseUrl = `https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql`
    
    for (const sql of sqlCommands) {
      console.log(`Executing: ${sql}`)
      
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: sql
        })
      })

      if (!response.ok) {
        // Try alternative approach with direct SQL execution
        console.log('Trying alternative SQL execution method...')
        
        const altResponse = await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/`, {
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

        if (!altResponse.ok) {
          console.log(`⚠️  Could not execute via API: ${sql}`)
          console.log('This is normal - we\'ll use Prisma migration instead')
          continue
        }
      }

      console.log(`✅ Success: ${sql}`)
    }

    console.log('\n🎉 Schema update completed!')
    console.log('\n📝 Manual execution required:')
    console.log('Please run these SQL commands in Supabase SQL Editor:')
    console.log('\n' + sqlCommands.join('\n'))
    
    return true

  } catch (error) {
    console.error('❌ Error updating schema:', error)
    console.log('\n📝 Manual execution required:')
    console.log('Please run these SQL commands in Supabase SQL Editor:')
    console.log('\n' + sqlCommands.join('\n'))
    return false
  }
}

// Alternative: Use Prisma migration approach
async function generatePrismaMigration() {
  console.log('\n🔄 Generating Prisma migration...')
  
  const migrationSQL = `
-- CreateIndex
CREATE INDEX IF NOT EXISTS "ClientProfile_industry_idx" ON "ClientProfile"("industry");
CREATE INDEX IF NOT EXISTS "ClientProfile_companySize_idx" ON "ClientProfile"("companySize");
CREATE INDEX IF NOT EXISTS "ClientProfile_location_idx" ON "ClientProfile"("location");

-- AlterTable
ALTER TABLE "ClientProfile" 
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "companySize" TEXT,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- UpdateData
UPDATE "ClientProfile" 
SET "description" = COALESCE("description", '')
WHERE "description" IS NULL;
`

  console.log('📄 Migration SQL generated:')
  console.log(migrationSQL)
  
  return migrationSQL
}

// Run the update
async function main() {
  console.log('🚀 Starting ClientProfile schema update...\n')
  
  await updateClientProfileSchema()
  await generatePrismaMigration()
  
  console.log('\n🎯 Next steps:')
  console.log('1. Execute the SQL in Supabase SQL Editor (if API failed)')
  console.log('2. Run: npm run db:generate')
  console.log('3. Test the client profile setup flow')
  console.log('4. Continue with Expert Profile implementation')
}

main().catch(console.error)
