-- DropIndex
DROP INDEX "Category_userId_name_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_userId_name_type_key" ON "Category"("userId", "name", "type");

-- Backfill: seeded categories are recognised by their English name and type
UPDATE "Category" SET "key" = 'food'          WHERE "type" = 'EXPENSE' AND "name" = 'Food & Drink';
UPDATE "Category" SET "key" = 'transport'     WHERE "type" = 'EXPENSE' AND "name" = 'Transport';
UPDATE "Category" SET "key" = 'shopping'      WHERE "type" = 'EXPENSE' AND "name" = 'Shopping';
UPDATE "Category" SET "key" = 'entertainment' WHERE "type" = 'EXPENSE' AND "name" = 'Entertainment';
UPDATE "Category" SET "key" = 'health'        WHERE "type" = 'EXPENSE' AND "name" = 'Health';
UPDATE "Category" SET "key" = 'housing'       WHERE "type" = 'EXPENSE' AND "name" = 'Housing';
UPDATE "Category" SET "key" = 'education'     WHERE "type" = 'EXPENSE' AND "name" = 'Education';
UPDATE "Category" SET "key" = 'other-expense' WHERE "type" = 'EXPENSE' AND "name" = 'Other';
UPDATE "Category" SET "key" = 'salary'        WHERE "type" = 'INCOME'  AND "name" = 'Salary';
UPDATE "Category" SET "key" = 'freelance'     WHERE "type" = 'INCOME'  AND "name" = 'Freelance';
UPDATE "Category" SET "key" = 'other-income'  WHERE "type" = 'INCOME'  AND "name" = 'Other';

-- Every user needs an INCOME fallback; the EXPENSE one already ships in the seed
INSERT INTO "Category" ("id", "userId", "name", "key", "icon", "color", "type", "isSystem", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, u."id", 'Other', 'other-income', 'i-lucide-package', '#34D399', 'INCOME', true, NOW(), NOW()
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1 FROM "Category" c WHERE c."userId" = u."id" AND c."key" = 'other-income'
);

UPDATE "Category" SET "isSystem" = true WHERE "key" IN ('other-expense', 'other-income');
