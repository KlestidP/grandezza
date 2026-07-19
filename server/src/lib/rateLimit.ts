import type { NextFunction, Request, Response } from "express";

// Minimal in-memory, fixed-window rate limiter -- no new dependency, keyed
// by IP. Good enough for a single-instance deployment; if this ever runs
// behind multiple instances, swap for a Redis-backed limiter instead (the
// in-process job queue has the same single-instance caveat, noted in
// lib/jobQueue.ts).
interface Bucket {
  count: number;
  resetAt: number;
}

export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  const buckets = new Map<string, Bucket>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    if (bucket.count >= options.max) {
      res.status(429).json({
        error: options.message ?? "Too many requests. Please try again shortly.",
      });
      return;
    }

    bucket.count += 1;
    next();
  };
}
