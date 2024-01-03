-- DropIndex
DROP INDEX "Account_userId_idx";

-- DropIndex
DROP INDEX "Artist_spotifyId_idx";

-- DropIndex
DROP INDEX "ArtistStatus_batchId_idx";

-- DropIndex
DROP INDEX "Playlist_spotifyId_idx";

-- DropIndex
DROP INDEX "PlaylistStatus_userId_idx";

-- DropIndex
DROP INDEX "Session_userId_idx";

-- CreateIndex
CREATE INDEX "ArtistStatus_userId_batchId_idx" ON "ArtistStatus"("userId", "batchId");
