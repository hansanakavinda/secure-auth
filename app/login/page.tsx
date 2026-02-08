import { LoginForm } from '../../components/auth/LoginForm'

import { Suspense } from 'react'

const LoginFallback = () => (
  <div className="w-full max-w-md p-8 space-y-4 animate-pulse">
    <div className="h-12 bg-stone-200 rounded-lg w-3/4 mx-auto" />
    <div className="h-64 bg-stone-100 rounded-xl" />
  </div>
);

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}