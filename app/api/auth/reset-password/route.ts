import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, token, newPassword } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // If only email is provided, send reset link
    if (!token && !newPassword) {
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        // Don't reveal if user exists or not for security
        return NextResponse.json({
          success: true,
          message: 'If an account with that email exists, a reset link has been sent.'
        })
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

      // Save reset token to database (temporarily disabled until schema update)
      // await prisma.user.update({
      //   where: { email },
      //   data: {
      //     resetToken,
      //     resetTokenExpiry
      //   }
      // })

      // TODO: Send email with reset link
      // For now, we'll just return the token (in production, this should be sent via email)
      console.log(`Reset token for ${email}: ${resetToken}`)

      return NextResponse.json({
        success: true,
        message: 'Password reset link has been sent to your email.',
        // Remove this in production - only for development
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      })
    }

    // If token and newPassword are provided, reset the password (temporarily disabled)
    if (token && newPassword) {
      // Temporarily disabled until schema update
      return NextResponse.json({
        success: false,
        message: 'Password reset functionality will be available after database update.'
      })
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
