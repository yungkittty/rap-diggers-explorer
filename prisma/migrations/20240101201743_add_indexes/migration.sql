-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Artist_spotifyId_idx" ON "Artist"("spotifyId");

-- CreateIndex
CREATE INDEX "ArtistStatus_userId_artistId_batchId_idx" ON "ArtistStatus"("userId", "artistId", "batchId");

-- CreateIndex
CREATE INDEX "Playlist_spotifyId_idx" ON "Playlist"("spotifyId");

-- CreateIndex
CREATE INDEX "PlaylistStatus_userId_playlistId_idx" ON "PlaylistStatus"("userId", "playlistId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
