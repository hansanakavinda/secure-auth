import React from 'react'
import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#4B3621] mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 rounded-xl border
          ${error ? 'border-red-500' : 'border-[#E5E5E4]'}
          bg-white text-[#4B3621]
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-[#CC5500] focus:border-transparent
          disabled:bg-[#F5F5F4] disabled:cursor-not-allowed
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#4B3621] mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-2.5 rounded-xl border
          ${error ? 'border-red-500' : 'border-[#E5E5E4]'}
          bg-white text-[#4B3621]
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-[#CC5500] focus:border-transparent
          disabled:bg-[#F5F5F4] disabled:cursor-not-allowed
          transition-all duration-200
          resize-vertical
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
