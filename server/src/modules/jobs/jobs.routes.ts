import { Router } from "express";
import { db } from "../../db.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { NotFoundError } from "../../lib/errors.js";

export const jobsRouter = Router();

jobsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    res.json(
      await db.jobLog.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: "desc" },
      }),
    );
  }),
);

jobsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const job = await db.jobLog.findUnique({ where: { id: req.params.id } });
    if (!job) throw new NotFoundError("Job");
    res.json(job);
  }),
);
