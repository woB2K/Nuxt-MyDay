-- CreateEnum
CREATE TYPE "HouseholdRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "shareSavings" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "userId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "role" "HouseholdRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "HouseholdInvite" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdInvite_pkey" PRIMARY KEY ("id")
);

-- Backfill: every existing user becomes the owner of a household of one
INSERT INTO "Household" ("id", "updatedAt")
SELECT 'hh' || substr(md5("id"), 1, 23), CURRENT_TIMESTAMP FROM "User";

INSERT INTO "HouseholdMember" ("userId", "householdId", "role")
SELECT "id", 'hh' || substr(md5("id"), 1, 23), 'OWNER' FROM "User";

-- AlterTable: add householdId, fill it from the owner's membership, then require it
ALTER TABLE "Transaction" ADD COLUMN "householdId" TEXT;
ALTER TABLE "SavingsEntry" ADD COLUMN "householdId" TEXT;
ALTER TABLE "Category" ADD COLUMN "householdId" TEXT;
ALTER TABLE "Budget" ADD COLUMN "householdId" TEXT;
ALTER TABLE "Tag" ADD COLUMN "householdId" TEXT;

UPDATE "Transaction" t SET "householdId" = m."householdId" FROM "HouseholdMember" m WHERE m."userId" = t."userId";
UPDATE "SavingsEntry" t SET "householdId" = m."householdId" FROM "HouseholdMember" m WHERE m."userId" = t."userId";
UPDATE "Category" t SET "householdId" = m."householdId" FROM "HouseholdMember" m WHERE m."userId" = t."userId";
UPDATE "Budget" t SET "householdId" = m."householdId" FROM "HouseholdMember" m WHERE m."userId" = t."userId";
UPDATE "Tag" t SET "householdId" = m."householdId" FROM "HouseholdMember" m WHERE m."userId" = t."userId";

ALTER TABLE "Transaction" ALTER COLUMN "householdId" SET NOT NULL;
ALTER TABLE "SavingsEntry" ALTER COLUMN "householdId" SET NOT NULL;
ALTER TABLE "Category" ALTER COLUMN "householdId" SET NOT NULL;
ALTER TABLE "Budget" ALTER COLUMN "householdId" SET NOT NULL;
ALTER TABLE "Tag" ALTER COLUMN "householdId" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_userId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_userId_fkey";

-- DropIndex
DROP INDEX "Budget_userId_categoryId_month_key";

-- DropIndex
DROP INDEX "Category_userId_name_type_key";

-- DropIndex
DROP INDEX "Tag_userId_name_key";

-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "userId";

-- CreateIndex
CREATE INDEX "HouseholdMember_householdId_idx" ON "HouseholdMember"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdInvite_tokenHash_key" ON "HouseholdInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "HouseholdInvite_householdId_idx" ON "HouseholdInvite"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_householdId_categoryId_month_key" ON "Budget"("householdId", "categoryId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Category_householdId_name_type_key" ON "Category"("householdId", "name", "type");

-- CreateIndex
CREATE INDEX "SavingsEntry_householdId_deletedAt_idx" ON "SavingsEntry"("householdId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_householdId_name_key" ON "Tag"("householdId", "name");

-- CreateIndex
CREATE INDEX "Transaction_householdId_deletedAt_idx" ON "Transaction"("householdId", "deletedAt");

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdInvite" ADD CONSTRAINT "HouseholdInvite_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdInvite" ADD CONSTRAINT "HouseholdInvite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsEntry" ADD CONSTRAINT "SavingsEntry_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
