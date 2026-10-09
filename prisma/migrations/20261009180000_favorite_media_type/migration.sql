-- AlterTable
ALTER TABLE "Favorite" ADD COLUMN "mediaType" TEXT NOT NULL DEFAULT 'movie';

-- DropIndex
DROP INDEX "Favorite_userId_movieId_listType_key";

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_movieId_listType_mediaType_key" ON "Favorite"("userId", "movieId", "listType", "mediaType");
