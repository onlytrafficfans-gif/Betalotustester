interface RateLimitConfig {
  windowMs: number; // milliseconds
  maxRequests: number; // per window
  keyGenerator: (req: { ip?: string; headers?: Record<string, string> }) => string;
}

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    // Cleanup stale entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  isAllowed(req: { ip?: string; headers?: Record<string, string> }): boolean {
    const key = this.config.keyGenerator(req);
    const now = Date.now();

    if (!this.store[key]) {
      this.store[key] = { count: 1, resetTime: now + this.config.windowMs };
      return true;
    }

    const entry = this.store[key];
    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + this.config.windowMs;
      return true;
    }

    entry.count++;
    return entry.count <= this.config.maxRequests;
  }

  getRemainingRequests(req: { ip?: string; headers?: Record<string, string> }): number {
    const key = this.config.keyGenerator(req);
    const entry = this.store[key];
    if (!entry) return this.config.maxRequests;
    if (Date.now() > entry.resetTime) return this.config.maxRequests;
    return Math.max(0, this.config.maxRequests - entry.count);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }
}

// Public endpoint: 10 req/min per IP
export const publicLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 10,
  keyGenerator: (req) => req.ip || "unknown"
});

// API endpoint: 60 req/min per API key
export const apiLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 60,
  keyGenerator: (req) => {
    const authHeader = req.headers?.["authorization"] || "";
    const apiKey = authHeader.replace(/^Bearer\s+/, "");
    return apiKey || (req.ip || "unknown");
  }
});
