import { LoginForm } from '../../components/auth/LoginForm'
import getSession from '@/lib/getSession'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

const LoginFallback = () => (
  <div className="w-full max-w-md p-8 space-y-4 animate-pulse">
    <div className="h-12 bg-stone-200 rounded-lg w-3/4 mx-auto" />
    <div className="h-64 bg-stone-100 rounded-xl" />
  </div>
);

export default async function LoginPage() {
  const session = await getSession()
  if (session) {
    redirect('/dashboard')
  }

  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}