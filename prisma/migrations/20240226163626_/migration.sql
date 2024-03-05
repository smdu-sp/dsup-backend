/*
  Warnings:

  - Added the required column `unidade_id` to the `ordens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ordens` ADD COLUMN `unidade_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `ordens` ADD CONSTRAINT `ordens_unidade_id_fkey` FOREIGN KEY (`unidade_id`) REFERENCES `unidades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
