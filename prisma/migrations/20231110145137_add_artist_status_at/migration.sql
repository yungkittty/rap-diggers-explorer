-- AlterTable
ALTER TABLE "ArtistStatus" ADD COLUMN     "dislikedAt" TIMESTAMP(3),
ADD COLUMN     "dugInAt" TIMESTAMP(3),
ADD COLUMN     "dugOutAt" TIMESTAMP(3),
ADD COLUMN     "likedAt" TIMESTAMP(3),
ADD COLUMN     "snoozedAt" TIMESTAMP(3);
