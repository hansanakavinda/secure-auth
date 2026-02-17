'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { ApiClient } from '@/lib/api/api-client'

interface PostModerationActionsProps {
  postId: string
}

export function PostModerationActions({ postId }: PostModerationActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const result = await ApiClient.post('/api/admin/posts/moderate', {
        postId,
        action: 'approve',
      })

      if (result.ok) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to approve post')
      }
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
      const result = await ApiClient.post('/api/admin/posts/moderate', {
        postId,
        action: 'reject',
      })

      if (result.ok) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to reject post')
      }
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
