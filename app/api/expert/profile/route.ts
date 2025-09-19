import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is an expert
    console.log('User role:', session.user.role)
    console.log('User ID:', session.user.id)
    
    if (session.user.role !== 'EXPERT') {
      return NextResponse.json(
        { error: `Only experts can update expert profiles. Your role: ${session.user.role}` },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      bio,
      expertise,
      yearsExperience,
      hourlyRate,
      location,
      phone,
      website,
      linkedIn,
      skills
    } = body

    // Validate required fields
    if (!firstName || !lastName || !bio) {
      return NextResponse.json(
        { error: 'First name, last name, and bio are required' },
        { status: 400 }
      )
    }

    // Update or create expert profile
    const expertProfile = await prisma.expertProfile.upsert({
      where: {
        userId: session.user.id
      },
      update: {
        firstName,
        lastName,
        bio,
        expertise: expertise || null,
        yearsExperience: yearsExperience || null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        location: location || null,
        phone: phone || null,
        website: website || null,
        linkedIn: linkedIn || null,
        updatedAt: new Date()
      },
      create: {
        id: `expert_${Date.now()}`,
        userId: session.user.id,
        firstName,
        lastName,
        bio,
        expertise: expertise || null,
        yearsExperience: yearsExperience || null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        location: location || null,
        phone: phone || null,
        website: website || null,
        linkedIn: linkedIn || null,
        updatedAt: new Date()
      }
    })

    // Update user's profileComplete status
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        profileComplete: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      profile: expertProfile,
      message: 'Expert profile created successfully'
    })

  } catch (error) {
    console.error('Expert profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is an expert
    if (session.user.role !== 'EXPERT') {
      return NextResponse.json(
        { error: 'Only experts can view expert profiles' },
        { status: 403 }
      )
    }

    // Get expert profile
    const expertProfile = await prisma.expertProfile.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!expertProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: expertProfile
    })

  } catch (error) {
    console.error('Expert profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
