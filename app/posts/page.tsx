import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/Sidebar'
import { getApprovedPostsPaginated } from '@/data-access/posts'
import { PostEditor } from './PostEditor'
import { PostsList } from './PostsList'

export default async function PostsPage() {
  const session = await auth()

  // Fetch initial 4 posts
  const initialPosts = await getApprovedPostsPaginated({ take: 4, skip: 0 })

  return (
    <div className="flex min-h-screen bg-[#FCFAF7]">
      {/* {session && (
        <Sidebar
          userRole={session.user.role}
          userName={session.user.name || 'User'}
          userEmail={session.user.email || ''}
        />
      )} */}

      <main className={`flex-1 p-8`}>
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#4B3621] mb-2">Public Post Wall</h1>
              <p className="text-gray-600">Share your thoughts with the community</p>
            </div>
            {session && <div className='flex gap-4 items-center'>
              <PostEditor />
              <div className=" p-4 rounded-xl bg-blue-50 border border-blue-200 ">
                <p className="text-sm text-blue-800">
                  <a href="/dashboard" className="font-semibold underline">Dashboard</a>
                </p>
              </div>
            </div>}

            {!session && (
              <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <a href="/login" className="font-semibold underline">Sign in</a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="max-w-4xl mx-auto">
          <PostsList initialPosts={initialPosts} />
        </div>
      </main>
    </div>
  )
}
