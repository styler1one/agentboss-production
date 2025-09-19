import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password, role = 'CLIENT', companyName, firstName, lastName } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role as 'CLIENT' | 'EXPERT' | 'ADMIN',
        emailVerified: false,
        profileComplete: false,
        ...(role === 'CLIENT' && companyName && {
          clientProfile: {
            create: {
              companyName,
              description: '',
            }
          }
        }),
        ...(role === 'EXPERT' && firstName && lastName && {
          expertProfile: {
            create: {
              firstName,
              lastName,
              bio: '',
              verificationStatus: 'PENDING'
            }
          }
        })
      },
      include: {
        clientProfile: true,
        expertProfile: true
      }
    })

    // Remove password hash from response
    const { passwordHash: _, ...userResponse } = user

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
