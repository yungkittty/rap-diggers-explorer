/*
  Warnings:

  - You are about to drop the column `playlistId` on the `ArtistStatus` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ArtistStatus" DROP CONSTRAINT "ArtistStatus_playlistId_fkey";

-- AlterTable
ALTER TABLE "ArtistStatus" DROP COLUMN "playlistId";
