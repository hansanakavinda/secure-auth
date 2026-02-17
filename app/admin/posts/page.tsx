import { auth } from '@/lib/auth'
import getSession from '@/lib/getSession'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { prisma } from '@/lib/prisma'
import { PostModerationActions } from './PostModerationActions'

export default async function AdminPostsPage() {
  const session = await getSession()

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/dashboard')
  }

  // Fetch pending and all posts
  const pendingPosts = await prisma.post.findMany({
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

  const recentApproved = await prisma.post.findMany({
    where: { isApproved: true },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  const stats = {
    pending: await prisma.post.count({ where: { isApproved: false } }),
    approved: await prisma.post.count({ where: { isApproved: true } }),
    total: await prisma.post.count(),
  }

  return (
    <div className="flex min-h-screen bg-[#FCFAF7]">
      <Sidebar
        userRole={session.user.role}
        userName={session.user.name || 'User'}
        userEmail={session.user.email || ''}
      />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#4B3621] mb-2">Post Moderation</h1>
          <p className="text-gray-600">Review and approve pending posts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-4xl text-yellow-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-4xl text-[#2D5A27]">{stats.approved}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total Posts</CardDescription>
              <CardTitle className="text-4xl text-[#CC5500]">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Pending Posts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Approval</CardTitle>
            <CardDescription>Posts awaiting moderation</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No posts pending approval</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-6 rounded-xl bg-[#F5F5F4] border-l-4 border-yellow-500"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#4B3621] mb-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600 mb-3">
                          <span>By {post.author.name || 'Unknown'}</span>
                          <span>•</span>
                          <span>{post.author.email}</span>
                          <span>•</span>
                          <Badge variant="default">{post.author.role}</Badge>
                          <span>•</span>
                          <span>
                            {new Date(post.createdAt).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                      </div>
                    </div>
                    <PostModerationActions postId={post.id} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Approved */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Approved</CardTitle>
            <CardDescription>Latest approved posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentApproved.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-[#F5F5F4] border-l-4 border-[#2D5A27]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#4B3621] mb-1">{post.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{post.author.name}</span>
                        <span>•</span>
                        <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant="success">Approved</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
