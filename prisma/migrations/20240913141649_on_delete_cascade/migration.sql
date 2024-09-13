-- DropForeignKey
ALTER TABLE `materiais` DROP FOREIGN KEY `materiais_servico_id_fkey`;

-- DropForeignKey
ALTER TABLE `ordens` DROP FOREIGN KEY `ordens_solicitante_id_fkey`;

-- DropForeignKey
ALTER TABLE `ordens` DROP FOREIGN KEY `ordens_unidade_id_fkey`;

-- DropForeignKey
ALTER TABLE `servicos` DROP FOREIGN KEY `servicos_ordem_id_fkey`;

-- DropForeignKey
ALTER TABLE `servicos` DROP FOREIGN KEY `servicos_tecnico_id_fkey`;

-- DropForeignKey
ALTER TABLE `suspensoes` DROP FOREIGN KEY `suspensoes_servico_id_fkey`;

-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `usuarios_unidade_id_fkey`;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_unidade_id_fkey` FOREIGN KEY (`unidade_id`) REFERENCES `unidades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordens` ADD CONSTRAINT `ordens_unidade_id_fkey` FOREIGN KEY (`unidade_id`) REFERENCES `unidades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordens` ADD CONSTRAINT `ordens_solicitante_id_fkey` FOREIGN KEY (`solicitante_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicos` ADD CONSTRAINT `servicos_tecnico_id_fkey` FOREIGN KEY (`tecnico_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicos` ADD CONSTRAINT `servicos_ordem_id_fkey` FOREIGN KEY (`ordem_id`) REFERENCES `ordens`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `suspensoes` ADD CONSTRAINT `suspensoes_servico_id_fkey` FOREIGN KEY (`servico_id`) REFERENCES `servicos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materiais` ADD CONSTRAINT `materiais_servico_id_fkey` FOREIGN KEY (`servico_id`) REFERENCES `servicos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
