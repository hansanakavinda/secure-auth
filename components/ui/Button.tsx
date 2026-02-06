import React from 'react'
import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-radius-[12px]'
  
  const variants = {
    primary: 'bg-[#CC5500] text-white hover:bg-[#B34C00] shadow-sm',
    secondary: 'bg-[#2D5A27] text-white hover:bg-[#244820] shadow-sm',
    accent: 'bg-[#4B3621] text-white hover:bg-[#3D2D1A] shadow-sm',
    outline: 'border-2 border-[#CC5500] text-[#CC5500] hover:bg-[#CC5500] hover:text-white',
    ghost: 'text-[#4B3621] hover:bg-[#F5F5F4]',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-base rounded-xl',
    lg: 'px-6 py-3 text-lg rounded-xl',
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
