import { db } from "../../db.js";

export async function recordPageView(path: string, referrer?: string) {
  await db.pageView.create({ data: { path, referrer } });
}

export async function getPageViewSummary() {
  const [total, byPath, last7Days] = await Promise.all([
    db.pageView.count(),
    db.pageView.groupBy({
      by: ["path"],
      _count: true,
      orderBy: { _count: { path: "desc" } },
      take: 20,
    }),
    db.pageView.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return { total, last7Days, byPath };
}
