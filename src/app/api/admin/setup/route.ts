import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 })
    }

    if (password.length < 12) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 12 characters long'
      }, { status: 400 })
    }

    // Check if an admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'An admin account already exists. Please sign in instead.'
      }, { status: 400 })
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email already exists'
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        subscriptionStatus: 'ACTIVE',
        emailVerified: new Date() // Auto-verify admin email
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully! You can now sign in.'
    })

  } catch (error) {
    console.error('Admin setup error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create admin account. Please try again.'
    }, { status: 500 })
  }
}