ALTER TABLE "Column" DROP CONSTRAINT "Column_boardId_fkey";
--> statement-breakpoint
ALTER TABLE "Task" DROP CONSTRAINT "Task_columnId_fkey";
--> statement-breakpoint
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_boardId_fkey";
--> statement-breakpoint
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";
--> statement-breakpoint
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_taskId_fkey";
--> statement-breakpoint
ALTER TABLE "UserTask" DROP CONSTRAINT "UserTask_userId_fkey";
--> statement-breakpoint
ALTER TABLE "UserTask" DROP CONSTRAINT "UserTask_taskId_fkey";
--> statement-breakpoint
ALTER TABLE "TaskTag" DROP CONSTRAINT "TaskTag_taskId_fkey";
--> statement-breakpoint
ALTER TABLE "TaskTag" DROP CONSTRAINT "TaskTag_tagId_fkey";
--> statement-breakpoint
ALTER TABLE "UserBoard" DROP CONSTRAINT "UserBoard_userId_fkey";
--> statement-breakpoint
ALTER TABLE "UserBoard" DROP CONSTRAINT "UserBoard_boardId_fkey";
--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Column" ADD CONSTRAINT "Column_boardId_Board_id_fk" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Task" ADD CONSTRAINT "Task_columnId_Column_id_fk" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Tag" ADD CONSTRAINT "Tag_boardId_Board_id_fk" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_Task_id_fk" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_taskId_Task_id_fk" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TaskTag" ADD CONSTRAINT "TaskTag_taskId_Task_id_fk" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TaskTag" ADD CONSTRAINT "TaskTag_tagId_Tag_id_fk" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserBoard" ADD CONSTRAINT "UserBoard_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserBoard" ADD CONSTRAINT "UserBoard_boardId_Board_id_fk" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
