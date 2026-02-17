import { ApiError } from "@/lib/api/api-utils"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import type { Role } from '@/types/auth'

export const createUser = async ({ name, email, password, role }: { name: string, email: string, password: string, role: Role }) => {
    
    const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    })

    if (existingUser) {
        throw new ApiError('Email already exists', 409)
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
            authProvider: 'MANUAL',
            isActive: true,
        },
        select: { id: true },
    })
    return { success: true, userId: user.id }
}

export const toggleUserStatus = async ({ userId, isActive, currentUserId }: { userId: string, isActive: boolean, currentUserId: string }) => {
    // Prevent self-deactivation
    if (userId === currentUserId && !isActive) {
        throw new ApiError('Cannot deactivate your own account', 400)
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    })

    if (!user) {
        throw new ApiError('User not found', 404)
    }

    await prisma.user.update({
        where: { id: userId },
        data: { isActive },
    })

    return { success: true }
}

export const changeUserRole = async ({ userId, role }: { userId: string, role: Role }) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    })

    if (!user) {
        throw new ApiError('User not found', 404)
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role },
    })

    return { success: true }
}