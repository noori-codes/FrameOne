-- CreateTable
CREATE TABLE "CustomList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomListItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL DEFAULT 'movie',
    "title" TEXT NOT NULL,
    "posterPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomList_userId_idx" ON "CustomList"("userId");

-- CreateIndex
CREATE INDEX "CustomListItem_listId_idx" ON "CustomListItem"("listId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomListItem_listId_movieId_mediaType_key" ON "CustomListItem"("listId", "movieId", "mediaType");

-- AddForeignKey
ALTER TABLE "CustomList" ADD CONSTRAINT "CustomList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomListItem" ADD CONSTRAINT "CustomListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "CustomList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
