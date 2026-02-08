import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { prisma } from '@/lib/prisma'
import { AddUserForm } from '@/components/user/AddUserForm'
import { UserRoleTabs } from '@/components/user/UserRoleTabs'

export default async function AdminPage() {
  const session = await auth()

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  })

  const userStats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    superAdmins: users.filter(u => u.role === 'SUPER_ADMIN').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    regularUsers: users.filter(u => u.role === 'USER').length,
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#4B3621] mb-2">User Management</h1>
            <p className="text-gray-600">
              Manage user roles, status, and view activity logs
            </p>
          </div>
          <AddUserForm />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardDescription className="text-xs">Total Users</CardDescription>
              <CardTitle className="text-2xl text-[#CC5500]">{userStats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-xs">Active</CardDescription>
              <CardTitle className="text-2xl text-[#2D5A27]">{userStats.active}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-xs">Inactive</CardDescription>
              <CardTitle className="text-2xl text-red-600">{userStats.inactive}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-xs">Super Admins</CardDescription>
              <CardTitle className="text-2xl text-[#4B3621]">{userStats.superAdmins}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-xs">Admins</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{userStats.admins}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-xs">Users</CardDescription>
              <CardTitle className="text-2xl text-gray-600">{userStats.regularUsers}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <UserRoleTabs users={users} currentUserId={session.user.id} />
      </main>
    </div>
  )
}
