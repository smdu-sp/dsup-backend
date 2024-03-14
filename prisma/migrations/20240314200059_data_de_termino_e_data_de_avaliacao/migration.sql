/*
  Warnings:

  - You are about to drop the column `concluido_em` on the `servicos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `servicos` DROP COLUMN `concluido_em`,
    ADD COLUMN `avaliado_em` DATETIME(3) NULL,
    ADD COLUMN `data_fim` DATETIME(3) NULL;
