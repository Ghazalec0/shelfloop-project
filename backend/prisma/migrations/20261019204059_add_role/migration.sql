-- DropIndex
DROP INDEX "Borrowing_bookId_idx";

-- DropIndex
DROP INDEX "Borrowing_userId_idx";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL;
