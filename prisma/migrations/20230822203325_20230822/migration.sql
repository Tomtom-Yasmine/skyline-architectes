-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `companySiret` VARCHAR(191) NOT NULL,
    `companyAddressNumber` VARCHAR(191) NOT NULL,
    `companyAddressStreet` VARCHAR(191) NOT NULL,
    `companyAddressAdditional` VARCHAR(191) NULL,
    `companyAddressCity` VARCHAR(191) NOT NULL,
    `companyAddressZipCode` VARCHAR(191) NOT NULL,
    `companyAddressCountry` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `passwordHash` VARCHAR(191) NOT NULL,
    `signedUpAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `storage` INTEGER NOT NULL DEFAULT 0,
    `havePaid` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phoneNumber_key`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL,
    `unitPriceExcludingTaxes` DOUBLE NOT NULL,
    `vat` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `fileId` VARCHAR(191) NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `File` (
    `id` VARCHAR(191) NOT NULL,
    `slugName` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `serverPath` VARCHAR(191) NOT NULL,
    `folderPath` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `extension` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `thumbnailPath` VARCHAR(191) NULL,
    `type` ENUM('INVOICE', 'USER_FILE') NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Log` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('FILE_UPLOAD', 'FILE_RENAME', 'FILE_DELETE', 'FILE_RESTORE', 'FILE_PIN', 'FILE_UNPIN', 'FILE_DOWNLOAD', 'USER_LOGIN_SUCCESS', 'USER_LOGIN_FAIL', 'USER_LOGOUT', 'USER_SIGNUP', 'USER_EMAIL_CONFIRM', 'USER_PASSWORD_RESET_REQUEST', 'USER_PASSWORD_RESET', 'USER_UPDATE', 'USER_DELETE', 'ORDER_CREATE', 'ORRDER_PAY_SUCCESS', 'ORDER_PAY_FAIL') NOT NULL,
    `message` VARCHAR(191) NULL,
    `logDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ipAddressHash` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
