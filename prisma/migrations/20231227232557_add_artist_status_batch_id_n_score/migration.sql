-- AlterTable
ALTER TABLE "ArtistStatus" ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;
