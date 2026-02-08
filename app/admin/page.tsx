import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { prisma } from '@/lib/prisma'
import { UserManagementActions } from './UserManagementActions'
import { AddUserForm } from '@/components/user/AddUserForm'

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

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>View and manage user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E5E4]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4B3621]">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4B3621]">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4B3621]">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4B3621]">Provider</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4B3621]">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4B3621]">Posts</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#4B3621]">Joined</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-[#4B3621]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[#F5F5F4] hover:bg-[#F5F5F4] transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CC5500] to-[#2D5A27] flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-[#4B3621]">{user.name || 'No Name'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{user.email}</td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={
                            user.role === 'SUPER_ADMIN'
                              ? 'danger'
                              : user.role === 'ADMIN'
                              ? 'info'
                              : 'default'
                          }
                        >
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={user.authProvider === 'GOOGLE' ? 'info' : 'default'}>
                          {user.authProvider}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{user._count.posts}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <UserManagementActions
                          userId={user.id}
                          userEmail={user.email}
                          currentRole={user.role}
                          isActive={user.isActive}
                          isCurrentUser={user.id === session.user.id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
