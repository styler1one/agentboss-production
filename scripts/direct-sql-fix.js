// Direct SQL execution via Supabase REST API
const SUPABASE_PROJECT_REF = 'zoqqhldmxbuwfbmtfvcs'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcXFobGRteGJ1d2ZibXRmdmNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI2NDYyOSwiZXhwIjoyMDczODQwNjI5fQ.154jk1UDZz-LOIdqCLV7gfjJHamQmgGXrt6x_jjltJo'

// Create a stored procedure to execute our schema updates
async function createSchemaUpdateFunction() {
  console.log('🔧 Creating schema update function...')
  
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION update_client_profile_schema()
    RETURNS TEXT AS $$
    BEGIN
      -- Add missing columns if they don't exist
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ClientProfile' AND column_name='website') THEN
        ALTER TABLE "ClientProfile" ADD COLUMN "website" TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ClientProfile' AND column_name='companySize') THEN
        ALTER TABLE "ClientProfile" ADD COLUMN "companySize" TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ClientProfile' AND column_name='location') THEN
        ALTER TABLE "ClientProfile" ADD COLUMN "location" TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ClientProfile' AND column_name='phone') THEN
        ALTER TABLE "ClientProfile" ADD COLUMN "phone" TEXT;
      END IF;
      
      -- Create indexes if they don't exist
      CREATE INDEX IF NOT EXISTS "ClientProfile_industry_idx" ON "ClientProfile"("industry");
      CREATE INDEX IF NOT EXISTS "ClientProfile_companySize_idx" ON "ClientProfile"("companySize");
      CREATE INDEX IF NOT EXISTS "ClientProfile_location_idx" ON "ClientProfile"("location");
      
      -- Update existing records
      UPDATE "ClientProfile" SET "description" = COALESCE("description", '') WHERE "description" IS NULL;
      
      RETURN 'Schema updated successfully';
    END;
    $$ LANGUAGE plpgsql;
  `

  try {
    const response = await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        sql: createFunctionSQL
      })
    })

    if (response.ok) {
      console.log('✅ Schema update function created')
      return true
    } else {
      const error = await response.text()
      console.log('⚠️  Function creation failed:', error)
      return false
    }
  } catch (error) {
    console.log('❌ Error creating function:', error.message)
    return false
  }
}

// Execute the schema update function
async function executeSchemaUpdate() {
  console.log('🚀 Executing schema update...')
  
  try {
    const response = await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/rpc/update_client_profile_schema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      }
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Schema update result:', result)
      return true
    } else {
      const error = await response.text()
      console.log('⚠️  Schema update failed:', error)
      return false
    }
  } catch (error) {
    console.log('❌ Error executing update:', error.message)
    return false
  }
}

// Verify the schema changes
async function verifySchema() {
  console.log('🔍 Verifying schema changes...')
  
  try {
    // Query the ClientProfile table structure
    const response = await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/ClientProfile?select=*&limit=0`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Prefer': 'return=representation'
      }
    })

    if (response.ok) {
      console.log('✅ ClientProfile table accessible')
      
      // Try to insert a test record to verify all fields work
      const testResponse = await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/ClientProfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: 'test_schema_' + Date.now(),
          userId: 'test_user_' + Date.now(),
          companyName: 'Test Company',
          industry: 'Technology',
          description: 'Test description',
          website: 'https://test.com',
          companySize: '1-10 employees',
          location: 'Amsterdam, NL',
          phone: '+31 6 12345678'
        })
      })

      if (testResponse.ok) {
        const testResult = await testResponse.json()
        console.log('✅ All fields working correctly')
        
        // Clean up test record
        await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1/ClientProfile?id=eq.${testResult[0].id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY
          }
        })
        
        return true
      } else {
        const error = await testResponse.text()
        console.log('⚠️  Field test failed:', error)
        return false
      }
    } else {
      const error = await response.text()
      console.log('⚠️  Table verification failed:', error)
      return false
    }
  } catch (error) {
    console.log('❌ Error verifying schema:', error.message)
    return false
  }
}

async function main() {
  console.log('🎯 Auto-fixing ClientProfile schema via direct API...\n')
  
  // Step 1: Create the update function
  const functionCreated = await createSchemaUpdateFunction()
  
  // Step 2: Execute the schema update
  let updateSuccess = false
  if (functionCreated) {
    updateSuccess = await executeSchemaUpdate()
  }
  
  // Step 3: Verify the changes
  const verificationSuccess = await verifySchema()
  
  if (updateSuccess || verificationSuccess) {
    console.log('\n🎉 Database schema updated successfully!')
    console.log('\n🔄 Regenerating Prisma client...')
    
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
        console.log('\n📋 Next steps:')
        console.log('1. Test client profile setup at http://localhost:3000')
        console.log('2. Login with CLIENT account')
        console.log('3. Complete profile form')
        console.log('4. Verify data saves correctly')
      } else {
        console.log('\n❌ Prisma generation failed. Run manually: npm run db:generate')
      }
    })
  } else {
    console.log('\n❌ Database update failed.')
    console.log('\n📝 Manual SQL needed:')
    console.log(`
ALTER TABLE "ClientProfile" 
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "companySize" TEXT,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT;

CREATE INDEX IF NOT EXISTS "ClientProfile_industry_idx" ON "ClientProfile"("industry");
CREATE INDEX IF NOT EXISTS "ClientProfile_companySize_idx" ON "ClientProfile"("companySize");
CREATE INDEX IF NOT EXISTS "ClientProfile_location_idx" ON "ClientProfile"("location");
    `)
  }
}

main().catch(console.error)
