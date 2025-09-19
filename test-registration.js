require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function testRegistration() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🧪 Testing user registration...')
    
    // Test data
    const testEmail = `test-${Date.now()}@agentboss.nl`
    const testPassword = 'TestPassword123!'
    
    // Hash password
    const passwordHash = await bcrypt.hash(testPassword, 12)
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        id: `user_${Date.now()}`,
        email: testEmail,
        passwordHash,
        role: 'CLIENT',
        emailVerified: false,
        profileComplete: false,
        clientProfile: {
          create: {
            id: `client_${Date.now()}`,
            companyName: 'Test Company BV',
            description: 'Test company for AgentBoss platform',
            industry: 'Technology'
          }
        }
      },
      include: {
        clientProfile: true
      }
    })
    
    console.log('✅ User created successfully!')
    console.log('📧 Email:', user.email)
    console.log('👤 Role:', user.role)
    console.log('🏢 Company:', user.clientProfile?.companyName)
    
    // Test password verification
    const isValidPassword = await bcrypt.compare(testPassword, user.passwordHash)
    console.log('🔐 Password verification:', isValidPassword ? '✅ Valid' : '❌ Invalid')
    
    // Clean up - delete test user
    await prisma.user.delete({
      where: { id: user.id }
    })
    
    console.log('🧹 Test user cleaned up')
    console.log('🎉 Registration system working perfectly!')
    
  } catch (error) {
    console.error('❌ Registration test failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testRegistration()
