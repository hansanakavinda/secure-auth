import { CredentialsSignin } from "next-auth"

// ---------------------------------------------------------------------------
// Custom error – caught by NextAuth's error page to show a countdown
// ---------------------------------------------------------------------------
export class RateLimitError extends CredentialsSignin {
  code = "RateLimited"

  constructor(
    public retryAfterMs: number,
    public guard: "ip" | "email",
  ) {
    super()
    this.message = `Too many login attempts. Try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface RateLimitEntry {
  /** Number of attempts recorded in the current window */
  count: number
  /** Timestamp (ms) when the window started */
  windowStart: number
}

interface DualGuardConfig {
  /** Max attempts per IP within the window (credential-stuffing guard) */
  ipLimit: number
  /** Max attempts per email within the window (brute-force guard) */
  emailLimit: number
  /** Window duration in milliseconds */
  windowMs: number
}

// ---------------------------------------------------------------------------
// Defaults – 15-minute window
// ---------------------------------------------------------------------------
const DEFAULT_CONFIG: DualGuardConfig = {
  ipLimit: 50,
  emailLimit: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
}

// ---------------------------------------------------------------------------
// Cleanup interval – purge expired entries every 5 minutes
// ---------------------------------------------------------------------------
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

// ---------------------------------------------------------------------------
// Singleton store survives Next.js HMR via globalThis
// ---------------------------------------------------------------------------
const GLOBAL_KEY = "__dual_rate_limiter_store__" as const

function getStore(): Map<string, RateLimitEntry> {
  const g = globalThis as Record<string, unknown>
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = new Map<string, RateLimitEntry>()
  }
  return g[GLOBAL_KEY] as Map<string, RateLimitEntry>
}

// ---------------------------------------------------------------------------
// DualRateLimiter
// ---------------------------------------------------------------------------
export class DualRateLimiter {
  private store: Map<string, RateLimitEntry>
  private config: DualGuardConfig
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor(config: Partial<DualGuardConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.store = getStore()
    this.startCleanup()
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Check both guards and throw `RateLimitError` if either limit is exceeded.
   * Must be called **before** password comparison.
   */
  check(ip: string, email: string): void {
    const now = Date.now()

    const ipKey = `ip:${ip}`
    const emailKey = `email:${email.toLowerCase()}`

    console.log(`[RateLimiter] Checking limits for IP: ${ip}, Email: ${email}`)

    // --- IP guard (credential-stuffing) ---
    const ipEntry = this.getOrCreate(ipKey, now)
    if (ipEntry.count >= this.config.ipLimit) {
      const retryAfterMs =
        ipEntry.windowStart + this.config.windowMs - now
      throw new RateLimitError(Math.max(retryAfterMs, 0), "ip")
    }

    // --- Email guard (targeted brute-force) ---
    const emailEntry = this.getOrCreate(emailKey, now)
    if (emailEntry.count >= this.config.emailLimit) {
      const retryAfterMs =
        emailEntry.windowStart + this.config.windowMs - now
      throw new RateLimitError(Math.max(retryAfterMs, 0), "email")
    }

    // Both guards passed — record the attempt.
    // Counts are NEVER reset on success (see security note below).
    ipEntry.count++
    emailEntry.count++
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  /**
   * Return an existing entry if its window is still active, otherwise create
   * a fresh one.
   */
  private getOrCreate(key: string, now: number): RateLimitEntry {
    const existing = this.store.get(key)

    if (existing && now - existing.windowStart < this.config.windowMs) {
      return existing
    }

    // Window expired or first request — start a new window
    const entry: RateLimitEntry = { count: 0, windowStart: now }
    this.store.set(key, entry)
    return entry
  }

  /**
   * Periodic cleanup: remove entries whose windows have expired.
   * Prevents unbounded Map growth on the 2 GB VPS.
   */
  private startCleanup(): void {
    // Avoid duplicate timers if constructor runs again after HMR
    const timerKey = "__dual_rate_limiter_timer__"
    const g = globalThis as Record<string, unknown>

    if (g[timerKey]) return

    this.cleanupTimer = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.store) {
        if (now - entry.windowStart >= this.config.windowMs) {
          this.store.delete(key)
        }
      }
    }, CLEANUP_INTERVAL_MS)

    // Allow the Node.js process to exit even if the timer is still running
    if (this.cleanupTimer && typeof this.cleanupTimer === "object" && "unref" in this.cleanupTimer) {
      this.cleanupTimer.unref()
    }

    g[timerKey] = true
  }
}

// ---------------------------------------------------------------------------
// Module-level singleton – importable across the app
// ---------------------------------------------------------------------------
export const limiter = new DualRateLimiter()
