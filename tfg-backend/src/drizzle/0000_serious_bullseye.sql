DO
$$
BEGIN
CREATE TYPE "UserBoardRole" AS ENUM('ADMIN', 'USER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Board"
(
    "id"
    uuid
    PRIMARY
    KEY
    NOT
    NULL,
    "name"
    varchar
(
    50
) NOT NULL
    );
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Column"
(
    "id"
    uuid
    PRIMARY
    KEY
    NOT
    NULL,
    "name"
    varchar
(
    255
) NOT NULL,
    "boardId" uuid NOT NULL
    );
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Comment"
(
    "id"
    uuid
    PRIMARY
    KEY
    NOT
    NULL,
    "text"
    text
    NOT
    NULL,
    "taskId"
    uuid
    NOT
    NULL,
    "userId"
    uuid
    NOT
    NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Tag"
(
    "id"
    uuid
    PRIMARY
    KEY
    NOT
    NULL,
    "name"
    varchar
(
    255
) NOT NULL,
    "color" varchar
(
    7
) NOT NULL,
    "boardId" uuid NOT NULL
    );
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Task"
(
    "id"
    uuid
    PRIMARY
    KEY
    NOT
    NULL,
    "name"
    varchar
(
    255
) NOT NULL,
    "description" text NOT NULL,
    "columnId" uuid NOT NULL,
    "imagePath" varchar
(
    255
),
    "startDate" timestamp with time zone,
    "endDate" timestamp with time zone
                            );
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TaskTag"
(
    "taskId"
    uuid
    NOT
    NULL,
    "tagId"
    uuid
    NOT
    NULL,
    CONSTRAINT
    "TaskTag_pkey"
    PRIMARY
    KEY
(
    "taskId",
    "tagId"
)
    );
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User"
(
    "username"
    varchar
(
    50
) NOT NULL,
    "password" varchar
(
    255
) NOT NULL,
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid
(
) NOT NULL
    );
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserBoard"
(
    "userId"
    uuid
    NOT
    NULL,
    "boardId"
    uuid
    NOT
    NULL,
    "role"
    "UserBoardRole"
    DEFAULT
    'USER'
    NOT
    NULL,
    CONSTRAINT
    "UserBoard_pkey"
    PRIMARY
    KEY
(
    "userId",
    "boardId"
)
    );
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserTask"
(
    "userId"
    uuid
    NOT
    NULL,
    "taskId"
    uuid
    NOT
    NULL,
    CONSTRAINT
    "UserTask_pkey"
    PRIMARY
    KEY
(
    "userId",
    "taskId"
)
    );
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User" ("username");--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "Column"
    ADD CONSTRAINT "Column_boardId_Board_id_fk" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "Comment"
    ADD CONSTRAINT "Comment_taskId_Task_id_fk" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "Comment"
    ADD CONSTRAINT "Comment_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "Tag"
    ADD CONSTRAINT "Tag_boardId_Board_id_fk" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "Task"
    ADD CONSTRAINT "Task_columnId_Column_id_fk" FOREIGN KEY ("columnId") REFERENCES "Column" ("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "TaskTag"
    ADD CONSTRAINT "TaskTag_taskId_Task_id_fk" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "TaskTag"
    ADD CONSTRAINT "TaskTag_tagId_Tag_id_fk" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "UserBoard"
    ADD CONSTRAINT "UserBoard_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "UserBoard"
    ADD CONSTRAINT "UserBoard_boardId_Board_id_fk" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "UserTask"
    ADD CONSTRAINT "UserTask_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "UserTask"
    ADD CONSTRAINT "UserTask_taskId_Task_id_fk" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
