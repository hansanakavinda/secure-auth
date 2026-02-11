'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

type Post = {
  id: string
  title: string
  content: string
  isApproved: boolean
  createdAt: Date | string
  author: {
    name: string | null
    email: string
    role: string
  }
}

interface PostsListProps {
  initialPosts: Post[]
}

export function PostsList({ initialPosts }: PostsListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length >= 4)
  const [lastScrollY, setLastScrollY] = useState(0)
  const loadingRef = useRef(false)

  const fetchMorePosts = async () => {
    if (loadingRef.current || !hasMore) return

    loadingRef.current = true
    setIsLoading(true)

    try {
      const response = await fetch(`/api/posts/list?take=4&skip=${posts.length}`)
      const data = await response.json()

      if (data.posts && data.posts.length > 0) {
        setPosts(prev => [...prev, ...data.posts])
        setHasMore(data.posts.length >= 4)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to fetch more posts:', error)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollingDown = currentScrollY > lastScrollY

      // Only fetch when scrolling down
      if (!scrollingDown) {
        setLastScrollY(currentScrollY)
        return
      }

      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const clientHeight = window.innerHeight
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight)

      // Trigger fetch when scrolled more than 500px and within 400px of bottom
      if (currentScrollY > 500 && distanceFromBottom < 400 && !loadingRef.current && hasMore) {
        fetchMorePosts()
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, hasMore])

  if (posts.length === 0) {
    return (
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
    )
  }

  return (
    <>
      <div className="space-y-6">
        {posts.map((post) => (
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
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-[#CC5500] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-600">Loading more posts...</p>
        </div>
      )}

      {/* End of Posts */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">You've reached the end! 🎉</p>
        </div>
      )}
    </>
  )
}
