// Simple in-memory cache with TTL support
// In production, this should be replaced with Redis or similar

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private timers = new Map<string, NodeJS.Timeout>();

  set<T>(key: string, data: T, ttlSeconds: number): void {
    // Clear existing timer
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiresAt });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttlSeconds * 1000);

    this.timers.set(key, timer);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  size(): number {
    return this.cache.size;
  }

  // Helper method for cache-aside pattern
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttlSeconds);
    return data;
  }
}

// Export singleton instance
export const cache = new InMemoryCache();

// Cache invalidation helpers
export class CacheInvalidation {
  static invalidateSystemTemplates(category?: string): void {
    if (category) {
      cache.delete(`system_templates:${category}`);
    } else {
      // Invalidate all template caches
      cache.delete('system_templates:all');
      // You could iterate through all known categories here
    }
  }

  static invalidateSystemDropdowns(category?: string): void {
    if (category) {
      cache.delete(`system_dropdowns:${category}`);
    } else {
      cache.delete('system_dropdowns:all');
    }
  }

  static invalidateOrganizationDropdowns(orgId: number, category?: string): void {
    if (category) {
      cache.delete(`org_dropdowns:${orgId}:${category}`);
      cache.delete(`merged_dropdowns:${orgId}:${category}`);
    } else {
      cache.delete(`org_dropdowns:${orgId}:all`);
      cache.delete(`merged_dropdowns:${orgId}:all`);
    }
  }

  static invalidateDefaultTags(): void {
    cache.delete('default_tags:all');
  }

  static invalidateEffectiveTags(orgId: number): void {
    cache.delete(`effective_tags:${orgId}`);
  }

  static invalidateAllForOrganization(orgId: number): void {
    // Invalidate all organization-specific caches
    const patterns = [
      `org_dropdowns:${orgId}:`,
      `merged_dropdowns:${orgId}:`,
      `effective_tags:${orgId}`,
    ];

    // This is a simple implementation - in production with Redis,
    // you'd use SCAN with patterns
    patterns.forEach(pattern => {
      if (pattern.endsWith(':')) {
        // Pattern matching - would need proper implementation
        cache.delete(`${pattern}all`);
      } else {
        cache.delete(pattern);
      }
    });
  }
}

// Rate limiting with in-memory store
// In production, use Redis for distributed rate limiting
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();

  isRateLimited(key: string, windowMs: number, maxRequests: number): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new window
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return false;
    }

    if (entry.count >= maxRequests) {
      return true;
    }

    entry.count++;
    return false;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

export const rateLimiter = new InMemoryRateLimiter();

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);