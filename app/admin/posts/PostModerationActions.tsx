'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface PostModerationActionsProps {
  postId: string
}

export function PostModerationActions({ postId }: PostModerationActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/posts/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: 'approve' }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to approve post')
      }
    } catch (error) {
      alert(`An error occurred: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/posts/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: 'reject' }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to reject post')
      }
    } catch (error) {
      alert(`An error occurred: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="secondary"
        onClick={handleApprove}
        disabled={isLoading}
      >
        ✓ Approve
      </Button>
      <Button
        variant="danger"
        onClick={handleReject}
        disabled={isLoading}
      >
        ✕ Reject
      </Button>
    </div>
  )
}
