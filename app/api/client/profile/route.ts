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

    // Check if user is a client
    console.log('User role:', session.user.role)
    console.log('User ID:', session.user.id)
    
    if (session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: `Only clients can update client profiles. Your role: ${session.user.role}` },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      companyName,
      industry,
      description,
      website,
      companySize,
      location,
      phone
    } = body

    // Validate required fields
    if (!companyName || !industry || !description) {
      return NextResponse.json(
        { error: 'Company name, industry, and description are required' },
        { status: 400 }
      )
    }

    // Update or create client profile
    const clientProfile = await prisma.clientProfile.upsert({
      where: {
        userId: session.user.id
      },
      update: {
        companyName,
        industry,
        description,
        website: website || null,
        companySize: companySize || null,
        location: location || null,
        phone: phone || null,
        updatedAt: new Date()
      },
      create: {
        id: `client_${Date.now()}`,
        userId: session.user.id,
        companyName,
        industry,
        description,
        website: website || null,
        companySize: companySize || null,
        location: location || null,
        phone: phone || null
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
      profile: clientProfile
    })

  } catch (error) {
    console.error('Client profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    // Check if user is a client
    if (session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Only clients can view client profiles' },
        { status: 403 }
      )
    }

    // Get client profile
    const clientProfile = await prisma.clientProfile.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!clientProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: clientProfile
    })

  } catch (error) {
    console.error('Client profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
