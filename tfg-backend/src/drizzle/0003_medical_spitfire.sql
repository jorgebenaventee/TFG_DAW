ALTER TABLE "Comment"
    ADD COLUMN "parentId" uuid;--> statement-breakpoint
DO
$$
BEGIN
ALTER TABLE "Comment"
    ADD CONSTRAINT "Comment_parentId_Comment_id_fk" FOREIGN KEY ("parentId") REFERENCES "Comment" ("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
