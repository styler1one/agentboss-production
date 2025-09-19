require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

async function checkTables() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Checking existing tables...')
    
    // Check what tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `
    
    console.log('📊 Existing tables:', tables)
    
    if (tables.length === 0) {
      console.log('ℹ️  No tables found - database is empty and ready for schema push')
    } else {
      console.log(`✅ Found ${tables.length} existing tables`)
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkTables()
