-- DropIndex
DROP INDEX "ArtistStatus_userId_artistId_batchId_idx";

-- DropIndex
DROP INDEX "PlaylistStatus_userId_playlistId_idx";

-- CreateIndex
CREATE INDEX "ArtistStatus_batchId_idx" ON "ArtistStatus"("batchId");

-- CreateIndex
CREATE INDEX "ArtistStatus_userId_idx" ON "ArtistStatus"("userId");

-- CreateIndex
CREATE INDEX "PlaylistStatus_userId_idx" ON "PlaylistStatus"("userId");
