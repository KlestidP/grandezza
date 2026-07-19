/*
  Warnings:

  - The required column `dashboardToken` was added to the `Client` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "billingStatus" TEXT NOT NULL DEFAULT 'TRIALING',
    "onboardingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "dashboardToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Client_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("billingStatus", "contactName", "createdAt", "email", "id", "leadId", "name", "onboardingStatus", "phone", "updatedAt") SELECT "billingStatus", "contactName", "createdAt", "email", "id", "leadId", "name", "onboardingStatus", "phone", "updatedAt" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_leadId_key" ON "Client"("leadId");
CREATE UNIQUE INDEX "Client_dashboardToken_key" ON "Client"("dashboardToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
