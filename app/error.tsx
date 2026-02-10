'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFAF7] p-4">
      <div
        className="text-center max-w-md w-full rounded-2xl border border-[#EFE4D8] bg-white/70 p-8 shadow-sm"
        aria-live="polite"
      >
        <h2 className="text-2xl font-bold text-[#4B3621] mb-3">Something went wrong!</h2>
        <p className="text-[#6B5A4A] mb-6">Our system encountered a small hiccup.</p>
        <button
          onClick={() => reset()}
          className="bg-[#2D5A27] text-white px-6 py-2 rounded-lg hover:bg-[#1e3d1a] transition"
        >
          Try again
        </button>
      </div>
    </div>
  )
}