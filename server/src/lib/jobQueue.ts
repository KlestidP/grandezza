// Local stand-in for the Redis + BullMQ "Send Queue" described in
// docs/backend-architecture.md. Jobs run async, in-process, immediately on
// enqueue -- there is no separate worker, no concurrency cap, no retry or
// backoff, and no durability across restarts (a job left PENDING/RUNNING
// when the dev server dies just stays that way). Every transition is
// persisted to JobLog so GET /api/jobs gives real visibility. Swap this for
// BullMQ + Redis before any real deployment.

import { db } from "../db.js";
import { logger } from "./logger.js";

type JobHandler = (payload: Record<string, unknown>) => Promise<Record<string, unknown>>;

const handlers = new Map<string, JobHandler>();

export function registerJobHandler(jobType: string, handler: JobHandler) {
  handlers.set(jobType, handler);
}

export async function enqueue(
  jobType: string,
  refId: string,
  payload: Record<string, unknown> = {},
) {
  const job = await db.jobLog.create({
    data: {
      jobType,
      refId,
      status: "PENDING",
      payloadJson: JSON.stringify(payload),
    },
  });

  void runJob(job.id, jobType, payload);

  return job;
}

async function runJob(jobId: string, jobType: string, payload: Record<string, unknown>) {
  const handler = handlers.get(jobType);
  if (!handler) {
    await db.jobLog.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: `No handler registered for job type "${jobType}"`,
        finishedAt: new Date(),
      },
    });
    return;
  }

  await db.jobLog.update({
    where: { id: jobId },
    data: { status: "RUNNING", startedAt: new Date(), attempts: { increment: 1 } },
  });

  try {
    const result = await handler(payload);
    await db.jobLog.update({
      where: { id: jobId },
      data: {
        status: "SUCCEEDED",
        resultJson: JSON.stringify(result),
        finishedAt: new Date(),
      },
    });
  } catch (err) {
    logger.error(`Job ${jobType} (${jobId}) failed`, { error: String(err) });
    await db.jobLog.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: err instanceof Error ? err.message : String(err),
        finishedAt: new Date(),
      },
    });
  }
}
