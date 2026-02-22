'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

import { Role } from '@/types/auth'

interface UserManagementActionsProps {
  userId: string
  userEmail: string
  currentRole: Role
  isActive: boolean
  isCurrentUser: boolean
}

export function UserManagementActions({
  userId,
  userEmail,
  currentRole,
  isActive,
  isCurrentUser,
}: UserManagementActionsProps) {
  const router = useRouter()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleStatus = async () => {
    if (isCurrentUser) {
      toast.warning('You cannot deactivate your own account')
      return
    }

    if (!confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} ${userEmail}?`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !isActive }),
      })

      if (response.ok) {
        router.refresh()
        toast.success(`User ${isActive ? 'deactivated' : 'activated'} successfully`)
      } else {
        toast.error('Failed to update user status')
      }
    } catch (error) {
      toast.error(`An error occurred while updating user status`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeRole = async (newRole: Role) => {
    if (isCurrentUser && newRole !== 'SUPER_ADMIN') {
      toast.warning('You cannot change your own role')
      return
    }

    if (!confirm(`Change ${userEmail} role to ${newRole}?`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users/change-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        router.refresh()
        toast.success(`User role updated to ${newRole.replace('_', ' ')}`)
      } else {
        toast.error('Failed to update user role')
      }
    } catch (error) {
      toast.error('An error occurred while changing user role')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-end space-x-2">
      <select
        className="px-3 py-1.5 text-sm rounded-lg border border-[#E5E5E4] bg-white text-[#4B3621] focus:outline-none focus:ring-2 focus:ring-[#CC5500] disabled:opacity-50"
        value={currentRole}
        onChange={(e) => handleChangeRole(e.target.value as Role)}
        disabled={isLoading || isCurrentUser}
      >
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
        <option value="SUPER_ADMIN">Super Admin</option>
      </select>

      <Button
        size="sm"
        variant={isActive ? 'danger' : 'secondary'}
        onClick={handleToggleStatus}
        disabled={isLoading || isCurrentUser}
      >
        {isActive ? 'Deactivate' : 'Activate'}
      </Button>
    </div>
  )
}
