'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface SidebarProps {
  userRole?: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
  userName?: string
  userEmail?: string
}

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      roles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
    },
    {
      name: 'Posts',
      path: '/posts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      roles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
    },
    {
      name: 'Moderation',
      path: '/admin/posts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      roles: ['ADMIN', 'SUPER_ADMIN'],
    },
    {
      name: 'User Management',
      path: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      roles: ['SUPER_ADMIN'],
    },
  ]

  const visibleMenuItems = menuItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  )

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-sidebar z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#E5E5E4]/50">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CC5500] to-[#2D5A27] flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#4B3621]">Secure Auth V2</h1>
            <p className="text-xs text-gray-500">Earthy Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleMenuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`
              flex items-center space-x-3 px-4 py-3 rounded-xl
              transition-all duration-200
              ${
                isActive(item.path)
                  ? 'bg-[#CC5500] text-white shadow-md'
                  : 'text-[#4B3621] hover:bg-[#F5F5F4]'
              }
            `}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Info */}
      {userName && (
        <div className="p-4 border-t border-[#E5E5E4]/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#F5F5F4]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D5A27] to-[#CC5500] flex items-center justify-center text-white font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#4B3621] truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full px-4 py-2 rounded-xl text-sm font-medium text-[#CC5500] hover:bg-[#F5F5F4] transition-colors duration-200 mt-2"
          >
            Sign Out
          </button>
        </div>
      )}
    </aside>
  )
}
