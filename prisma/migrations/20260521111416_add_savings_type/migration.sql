/*
  Warnings:

  - Added the required column `type` to the `SavingsEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SavingsType" AS ENUM ('DEPOSIT', 'WITHDRAWAL');

-- AlterTable
ALTER TABLE "SavingsEntry" ADD COLUMN     "type" "SavingsType" NOT NULL;
