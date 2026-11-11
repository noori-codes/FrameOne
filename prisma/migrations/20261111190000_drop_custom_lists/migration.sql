-- DropForeignKey
ALTER TABLE "CustomListItem" DROP CONSTRAINT IF EXISTS "CustomListItem_listId_fkey";

-- DropForeignKey
ALTER TABLE "CustomList" DROP CONSTRAINT IF EXISTS "CustomList_userId_fkey";

-- DropTable
DROP TABLE IF EXISTS "CustomListItem";

-- DropTable
DROP TABLE IF EXISTS "CustomList";
