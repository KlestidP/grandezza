-- AlterTable
ALTER TABLE "Client" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Client" ADD COLUMN "stripeSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_stripeCustomerId_key" ON "Client"("stripeCustomerId");
