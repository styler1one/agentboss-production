import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('Testing auth with email:', email)
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required for test' },
        { status: 400 }
      )
    }

    // Try to find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clientProfile: true,
        expertProfile: true
      }
    })

    console.log('User found:', user ? 'YES' : 'NO')
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found in database',
        email,
        timestamp: new Date().toISOString()
      })
    }

    console.log('User has password hash:', user.passwordHash ? 'YES' : 'NO')
    
    if (!user.passwordHash) {
      return NextResponse.json({
        success: false,
        message: 'User found but no password hash',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        timestamp: new Date().toISOString()
      })
    }

    // Test password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    console.log('Password valid:', isPasswordValid ? 'YES' : 'NO')

    return NextResponse.json({
      success: true,
      message: 'Auth test completed',
      results: {
        userFound: true,
        hasPasswordHash: !!user.passwordHash,
        passwordValid: isPasswordValid,
        userRole: user.role,
        profileComplete: user.profileComplete
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json(
      { 
        error: 'Auth test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
