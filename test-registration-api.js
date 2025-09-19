require('dotenv').config()

async function testRegistrationAPI() {
  try {
    console.log('🧪 Testing registration API...')
    
    const testData = {
      email: `test-${Date.now()}@agentboss.nl`,
      password: 'TestPassword123!',
      role: 'CLIENT',
      companyName: 'Test Company BV'
    }
    
    console.log('📧 Test email:', testData.email)
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Registration API successful!')
      console.log('👤 User created:', result.user?.email)
      console.log('🏢 Company:', result.user?.clientProfile?.companyName)
    } else {
      console.log('❌ Registration API failed:', result.error)
      console.log('Status:', response.status)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testRegistrationAPI()
