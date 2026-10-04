-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "posterPath" TEXT,
    "listType" TEXT NOT NULL DEFAULT 'favorite',
    "rating" INTEGER,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Favorite" ("createdAt", "id", "movieId", "note", "posterPath", "rating", "title", "userId") SELECT "createdAt", "id", "movieId", "note", "posterPath", "rating", "title", "userId" FROM "Favorite";
DROP TABLE "Favorite";
ALTER TABLE "new_Favorite" RENAME TO "Favorite";
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");
CREATE INDEX "Favorite_userId_listType_idx" ON "Favorite"("userId", "listType");
CREATE UNIQUE INDEX "Favorite_userId_movieId_listType_key" ON "Favorite"("userId", "movieId", "listType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
