/*
  Warnings:

  - A unique constraint covering the columns `[userId,spotifyId]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `playlistId` to the `ArtistStatus` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Playlist_spotifyId_key";

-- AlterTable
ALTER TABLE "ArtistStatus" ADD COLUMN     "playlistId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_userId_spotifyId_key" ON "Playlist"("userId", "spotifyId");

-- AddForeignKey
ALTER TABLE "ArtistStatus" ADD CONSTRAINT "ArtistStatus_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
