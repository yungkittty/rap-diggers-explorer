-- DropIndex
DROP INDEX "ArtistStatus_userId_batchId_idx";

-- CreateIndex
CREATE INDEX "ArtistStatus_batchId_idx" ON "ArtistStatus"("batchId");
