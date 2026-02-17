import { auth } from '@/lib/auth'
import getSession from '@/lib/getSession'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch user stats
  const userPosts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const totalPosts = await prisma.post.count({
    where: { authorId: session.user.id },
  })

  const approvedPosts = await prisma.post.count({
    where: { 
      authorId: session.user.id,
      isApproved: true,
    },
  })

  const pendingPosts = await prisma.post.count({
    where: { 
      authorId: session.user.id,
      isApproved: false,
    },
  })

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
          <h1 className="text-4xl font-bold text-[#4B3621] mb-2">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>

        {/* Role Badge */}
        <div className="mb-6">
          <Badge
            variant={
              session.user.role === 'SUPER_ADMIN'
                ? 'danger'
                : session.user.role === 'ADMIN'
                ? 'info'
                : 'default'
            }
          >
            {session.user.role.replace('_', ' ')}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Total Posts</CardDescription>
              <CardTitle className="text-4xl text-[#CC5500]">{totalPosts}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">All your published content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-4xl text-[#2D5A27]">{approvedPosts}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Visible to the public</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Pending Approval</CardDescription>
              <CardTitle className="text-4xl text-yellow-600">{pendingPosts}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Awaiting moderation</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Posts</CardTitle>
            <CardDescription>Your latest submissions and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {userPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven&apos;t created any posts yet.</p>
                <a
                  href="/posts"
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-[#CC5500] text-white hover:bg-[#B34C00] transition-colors"
                >
                  Create Your First Post
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start justify-between p-4 rounded-xl bg-[#F5F5F4] hover:bg-[#ECECEB] transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#4B3621] mb-1">{post.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant={post.isApproved ? 'success' : 'warning'}>
                      {post.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hover className="cursor-pointer">
            <a href="/posts" className="block">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-[#CC5500] flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Create New Post</CardTitle>
                    <CardDescription>Share your thoughts with the community</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </a>
          </Card>

          {(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
            <Card hover className="cursor-pointer">
              <a href="/admin/posts" className="block">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-[#2D5A27] flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Moderate Posts</CardTitle>
                      <CardDescription>Review and approve pending submissions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </a>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
