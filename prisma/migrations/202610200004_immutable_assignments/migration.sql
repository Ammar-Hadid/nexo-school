CREATE TABLE "ArithmeticQuestionVersion" (
 "id" TEXT PRIMARY KEY, "templateVersion" TEXT NOT NULL, "evaluatorVersion" TEXT NOT NULL,
 "validatorVersion" TEXT NOT NULL, "curriculumVersion" TEXT NOT NULL, "skillId" TEXT NOT NULL,
 "subject" TEXT NOT NULL, "category" TEXT NOT NULL, "prompt" TEXT NOT NULL,
 "answer" TEXT NOT NULL, "responseType" TEXT NOT NULL, "seed" TEXT NOT NULL,
 "publicationPolicy" TEXT NOT NULL CHECK ("publicationPolicy" = 'synthetic-addition-seed-v1'),
 "rights" TEXT NOT NULL, "contentHash" TEXT NOT NULL CHECK ("contentHash" ~ '^[a-f0-9]{64}$'),
 "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "ArithmeticQuestionVersion_contentHash_key" ON "ArithmeticQuestionVersion"("contentHash");
CREATE TABLE "Assignment" (
 "id" TEXT PRIMARY KEY, "studentId" TEXT NOT NULL REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
 "createdBy" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
 "requestId" TEXT NOT NULL, "requestHash" TEXT NOT NULL,
 "revision" INTEGER NOT NULL DEFAULT 1 CHECK ("revision" = 1),
 "selectionVersion" TEXT NOT NULL, "itemCount" INTEGER NOT NULL CHECK ("itemCount" BETWEEN 1 AND 10),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Assignment_createdBy_requestId_key" ON "Assignment"("createdBy", "requestId");
CREATE INDEX "Assignment_studentId_createdAt_id_idx" ON "Assignment"("studentId", "createdAt", "id");
CREATE TABLE "AssignmentItem" (
 "id" TEXT PRIMARY KEY,
 "assignmentId" TEXT NOT NULL REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
 "position" INTEGER NOT NULL CHECK ("position" BETWEEN 0 AND 9),
 "questionVersionId" TEXT NOT NULL REFERENCES "ArithmeticQuestionVersion"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX "AssignmentItem_assignmentId_position_key" ON "AssignmentItem"("assignmentId", "position");
CREATE UNIQUE INDEX "AssignmentItem_assignmentId_questionVersionId_key" ON "AssignmentItem"("assignmentId", "questionVersionId");
-- Immutable facts cannot be changed through normal runtime operations.
CREATE FUNCTION nexo_d05_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Immutable D05 fact'; END $$;
CREATE TRIGGER immutable_question BEFORE UPDATE OR DELETE ON "ArithmeticQuestionVersion" FOR EACH ROW EXECUTE FUNCTION nexo_d05_immutable();
CREATE TRIGGER immutable_assignment BEFORE UPDATE OR DELETE ON "Assignment" FOR EACH ROW EXECUTE FUNCTION nexo_d05_immutable();
CREATE TRIGGER immutable_assignment_item BEFORE UPDATE OR DELETE ON "AssignmentItem" FOR EACH ROW EXECUTE FUNCTION nexo_d05_immutable();
-- At commit, membership must be complete and contiguous. Later insertion cannot extend it.
CREATE FUNCTION nexo_d05_membership() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target TEXT; expected INTEGER; actual INTEGER; last_position INTEGER;
BEGIN
 IF TG_TABLE_NAME = 'Assignment' THEN target := NEW.id; ELSE target := NEW."assignmentId"; END IF;
 SELECT "itemCount" INTO expected FROM "Assignment" WHERE id = target;
 SELECT count(*), max(position) INTO actual, last_position FROM "AssignmentItem" WHERE "assignmentId" = target;
 IF actual <> expected OR last_position <> expected - 1 THEN RAISE EXCEPTION 'Incomplete assignment'; END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER complete_assignment AFTER INSERT ON "Assignment" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION nexo_d05_membership();
CREATE CONSTRAINT TRIGGER complete_membership AFTER INSERT ON "AssignmentItem" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION nexo_d05_membership();
