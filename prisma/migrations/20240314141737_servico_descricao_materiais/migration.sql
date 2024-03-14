/*
  Warnings:

  - You are about to drop the `servico_materiais` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `servico_materiais` DROP FOREIGN KEY `servico_materiais_servico_id_fkey`;

-- AlterTable
ALTER TABLE `servicos` ADD COLUMN `descricao` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `servico_materiais`;

-- CreateTable
CREATE TABLE `materiais` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `medida` VARCHAR(191) NOT NULL,
    `servico_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `materiais` ADD CONSTRAINT `materiais_servico_id_fkey` FOREIGN KEY (`servico_id`) REFERENCES `servicos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
