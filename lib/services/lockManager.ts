/**
 * Simple in-memory lock manager to prevent stampede
 * 
 * In production with multiple instances, use Redis or similar
 * For now, this prevents concurrent calls within a single instance
 */

interface Lock {
  key: string;
  acquiredAt: number;
  ttl: number;
}

class LockManager {
  private locks: Map<string, Lock> = new Map();
  private readonly DEFAULT_TTL = 10000; // 10 seconds

  /**
   * Try to acquire a lock
   * @returns true if lock acquired, false if already locked
   */
  async tryAcquire(key: string, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    this.cleanup(); // Clean expired locks

    if (this.locks.has(key)) {
      return false; // Already locked
    }

    this.locks.set(key, {
      key,
      acquiredAt: Date.now(),
      ttl,
    });

    return true;
  }

  /**
   * Release a lock
   */
  async release(key: string): Promise<void> {
    this.locks.delete(key);
  }

  /**
   * Wait for a lock to be released
   * @param timeout - Maximum time to wait in ms
   */
  async waitForRelease(key: string, timeout: number = 5000): Promise<void> {
    const start = Date.now();
    
    while (this.locks.has(key)) {
      if (Date.now() - start > timeout) {
        throw new Error(`Lock wait timeout for key: ${key}`);
      }
      
      // Wait a bit before checking again
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  /**
   * Clean up expired locks
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, lock] of this.locks.entries()) {
      if (now - lock.acquiredAt > lock.ttl) {
        this.locks.delete(key);
      }
    }
  }
}

// Singleton instance
export const lockManager = new LockManager();
