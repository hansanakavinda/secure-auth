import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { prisma } from '@/lib/prisma'
import { PostEditor } from './PostEditor'

export default async function PostsPage() {
  const session = await auth()

  // Fetch all approved posts
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

  return (
    <div className="flex min-h-screen bg-[#FCFAF7]">
      {session && (
        <Sidebar
          userRole={session.user.role}
          userName={session.user.name || 'User'}
          userEmail={session.user.email || ''}
        />
      )}

      <main className={`flex-1 ${session ? 'ml-64' : ''} p-8`}>
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#4B3621] mb-2">Public Post Wall</h1>
              <p className="text-gray-600">Share your thoughts with the community</p>
            </div>
            {session && <PostEditor />}
          </div>

          {!session && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                <a href="/login" className="font-semibold underline">Sign in</a> to create and share your own posts!
              </p>
            </div>
          )}
        </div>

        {/* Posts Grid */}
        <div className="max-w-4xl mx-auto space-y-6">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F5F4] flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#4B3621] mb-2">No posts yet</h3>
                <p className="text-gray-600">Be the first to share something with the community!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} hover>
                <CardContent className="p-6">
                  {/* Author Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CC5500] to-[#2D5A27] flex items-center justify-center text-white font-semibold text-lg">
                      {post.author.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-[#4B3621]">{post.author.name || 'Anonymous'}</p>
                        <Badge variant="default" className="text-xs">
                          {post.author.role.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <h2 className="text-2xl font-bold text-[#4B3621] mb-3">{post.title}</h2>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-[#F5F5F4] flex items-center justify-between">
                    <Badge variant="success">✓ Approved</Badge>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Public</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
