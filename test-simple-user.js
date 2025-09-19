require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

async function testSimpleUser() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🧪 Testing simple user creation...')
    
    // Test data
    const testEmail = `test-${Date.now()}@agentboss.nl`
    
    // Create simple user first
    const user = await prisma.user.create({
      data: {
        id: `user_${Date.now()}`,
        email: testEmail,
        role: 'CLIENT',
        emailVerified: false,
        profileComplete: false
      }
    })
    
    console.log('✅ Simple user created successfully!')
    console.log('📧 Email:', user.email)
    console.log('👤 Role:', user.role)
    console.log('🆔 ID:', user.id)
    
    // Now create client profile separately
    const clientProfile = await prisma.clientProfile.create({
      data: {
        id: `client_${Date.now()}`,
        userId: user.id,
        companyName: 'Test Company BV',
        description: 'Test company for AgentBoss platform'
      }
    })
    
    console.log('✅ Client profile created successfully!')
    console.log('🏢 Company:', clientProfile.companyName)
    
    // Clean up
    await prisma.clientProfile.delete({
      where: { id: clientProfile.id }
    })
    
    await prisma.user.delete({
      where: { id: user.id }
    })
    
    console.log('🧹 Test data cleaned up')
    console.log('🎉 Database integration working perfectly!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSimpleUser()
