import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test database connection
    const userCount = await prisma.user.count()
    console.log(`Found ${userCount} users in database`)
    
    // Test a simple user query
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log('Sample users:', users)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      sampleUsers: users,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        error: 'Database connection failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
