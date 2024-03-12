/*
  Warnings:

  - The primary key for the `UserBoard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserBoard` table. All the data in the column will be lost.
  - The primary key for the `UserTask` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserTask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserBoard" DROP CONSTRAINT "UserBoard_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "UserBoard_pkey" PRIMARY KEY ("userId", "boardId");

-- AlterTable
ALTER TABLE "UserTask" DROP CONSTRAINT "UserTask_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "UserTask_pkey" PRIMARY KEY ("userId", "taskId");

-- CreateTable
CREATE TABLE "TaskTag" (
    "taskId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "TaskTag_pkey" PRIMARY KEY ("taskId","tagId")
);

-- AddForeignKey
ALTER TABLE "TaskTag" ADD CONSTRAINT "TaskTag_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTag" ADD CONSTRAINT "TaskTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
