-- CreateTable
CREATE TABLE `DreamConnection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dreamIdA` INTEGER NOT NULL,
    `dreamIdB` INTEGER NOT NULL,
    `puntuacion` INTEGER NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DreamConnection_dreamIdA_dreamIdB_key`(`dreamIdA`, `dreamIdB`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DreamConnection` ADD CONSTRAINT `DreamConnection_dreamIdA_fkey` FOREIGN KEY (`dreamIdA`) REFERENCES `Dream`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DreamConnection` ADD CONSTRAINT `DreamConnection_dreamIdB_fkey` FOREIGN KEY (`dreamIdB`) REFERENCES `Dream`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
