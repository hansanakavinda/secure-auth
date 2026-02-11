import { ApiError } from "@/lib/api-utils"
import { prisma } from "@/lib/prisma"

export const moderatePost = async ({ postId, action }: { postId: string, action: 'approve' | 'reject' }) => {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true },
    })

    if (!post) {
        throw new ApiError('Post not found', 404)
    }

    if (action === 'approve') {
        await prisma.post.update({
            where: { id: postId },
            data: { isApproved: true },
        })
    } else {
        await prisma.post.delete({
            where: { id: postId },
        })
    }

    return { success: true }
}

export const createPost = async ({ title, content, authorId }: { title: string, content: string, authorId: string }) => {
    const post = await prisma.post.create({
        data: {
            title: title.trim(),
            content: content.trim(),
            authorId,
            isApproved: false, 
        },
    })

    return { success: true, post }
}

export const getPendingPosts = async () => {
    const posts = await prisma.post.findMany({
        where: { isApproved: false },
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    return posts
}

export const getApprovedPosts = async () => {
    const posts = await prisma.post.findMany({
        where: { isApproved: true },
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    return posts
}

export const getUserPosts = async (userId: string, options?: { take?: number }) => {
    const posts = await prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        ...(options?.take && { take: options.take }),
    })

    return posts
}

export const getUserPostStats = async (userId: string) => {
    const totalPosts = await prisma.post.count({
        where: { authorId: userId },
    })

    const approvedPosts = await prisma.post.count({
        where: { 
            authorId: userId,
            isApproved: true,
        },
    })

    const pendingPosts = await prisma.post.count({
        where: { 
            authorId: userId,
            isApproved: false,
        },
    })

    return {
        totalPosts,
        approvedPosts,
        pendingPosts,
    }
}
