/*
  Warnings:

  - The `isApproved` column on the `Patner` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Patner" DROP COLUMN "isApproved",
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;
