-- CreateTable
CREATE TABLE "TvEpisodeWatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showId" INTEGER NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TvEpisodeWatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TvEpisodeWatch_userId_showId_idx" ON "TvEpisodeWatch"("userId", "showId");

-- CreateIndex
CREATE UNIQUE INDEX "TvEpisodeWatch_userId_showId_seasonNumber_episodeNumber_key" ON "TvEpisodeWatch"("userId", "showId", "seasonNumber", "episodeNumber");

-- AddForeignKey
ALTER TABLE "TvEpisodeWatch" ADD CONSTRAINT "TvEpisodeWatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
