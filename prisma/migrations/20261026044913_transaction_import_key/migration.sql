-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "importKey" VARCHAR(32);

-- CreateIndex
CREATE INDEX "Transaction_householdId_importKey_idx" ON "Transaction"("householdId", "importKey");
