/*
  Warnings:

  - You are about to drop the column `local` on the `ordens` table. All the data in the column will be lost.
  - Added the required column `andar` to the `ordens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sala` to the `ordens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ordens` DROP COLUMN `local`,
    ADD COLUMN `andar` INTEGER NOT NULL,
    ADD COLUMN `sala` VARCHAR(191) NOT NULL;
