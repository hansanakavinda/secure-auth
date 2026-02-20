'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { Role } from '@/types/auth'

// example
import { createUserAction } from '@/lib/actions/users'

const roles: Role[] = ['USER', 'ADMIN', 'SUPER_ADMIN']

export function AddUserForm() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('USER')
  const [error, setError] = useState('')

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setRole('USER')
    setError('')
  }

  const handleClose = () => {
    if (isLoading) return
    setIsOpen(false)
    resetForm()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {

      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('email', email.trim().toLowerCase())
      formData.append('password', password)
      formData.append('role', role)

      const result = await createUserAction(formData)

      if (!result.success) {
        setError(result.error || 'Failed to create user')
        return
      }

      // const response = await fetch('/api/admin/users/create', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password, role }),
      // })

      // if (!response.ok) {
      //   const payload = await response.json().catch(() => null)
      //   setError(payload?.error || 'Failed to create user')
      //   return
      // }

      handleClose()
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        Add User
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} title="Add New User" size="md">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="jane@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={isLoading}
          />

          <div>
            <label className="block text-sm font-medium text-[#4B3621] mb-1.5">
              Role
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E4] bg-white text-[#4B3621] focus:outline-none focus:ring-2 focus:ring-[#CC5500] focus:border-transparent disabled:bg-[#F5F5F4] disabled:cursor-not-allowed transition-all duration-200"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              disabled={isLoading}
            >
              {roles.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
