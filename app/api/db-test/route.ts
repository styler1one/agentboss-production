import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test database connection without Prisma first
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_URL not found' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection string found',
      hasConnection: !!connectionString,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
