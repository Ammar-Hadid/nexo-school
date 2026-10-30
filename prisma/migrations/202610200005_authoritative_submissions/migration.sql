CREATE UNIQUE INDEX "AssignmentItem_id_assignmentId_key" ON "AssignmentItem"("id", "assignmentId");
CREATE TABLE "PracticeAttempt" (
 "id" TEXT PRIMARY KEY,
 "assignmentId" TEXT NOT NULL REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
 "itemId" TEXT NOT NULL,
 "requestId" TEXT NOT NULL,
 "requestHash" TEXT NOT NULL CHECK ("requestHash" ~ '^[a-f0-9]{64}$'),
 "sequence" INTEGER NOT NULL CHECK ("sequence" BETWEEN 1 AND 20),
 "attemptNumber" INTEGER NOT NULL CHECK ("attemptNumber" IN (1, 2)),
 "rawAnswer" TEXT NOT NULL CHECK (length("rawAnswer") BETWEEN 1 AND 64),
 "normalizedAnswer" TEXT NOT NULL CHECK ("normalizedAnswer" ~ '^(0|[1-9][0-9]{0,5})$'),
 "correct" BOOLEAN NOT NULL,
 "scoreUnits" INTEGER NOT NULL,
 "evaluatorVersion" TEXT NOT NULL CHECK ("evaluatorVersion" = 'integer-exact-v1'),
 "policyVersion" TEXT NOT NULL DEFAULT 'deferred-retry-v1' CHECK ("policyVersion" = 'deferred-retry-v1'),
 "response" JSONB NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "PracticeAttempt_itemId_assignmentId_fkey" FOREIGN KEY ("itemId", "assignmentId") REFERENCES "AssignmentItem"("id", "assignmentId") ON DELETE RESTRICT ON UPDATE RESTRICT,
 CONSTRAINT "PracticeAttempt_score_check" CHECK ("scoreUnits" = CASE WHEN NOT "correct" THEN 0 WHEN "attemptNumber" = 1 THEN 2 ELSE 1 END)
);
CREATE UNIQUE INDEX "PracticeAttempt_assignmentId_requestId_key" ON "PracticeAttempt"("assignmentId", "requestId");
CREATE UNIQUE INDEX "PracticeAttempt_assignmentId_sequence_key" ON "PracticeAttempt"("assignmentId", "sequence");
CREATE UNIQUE INDEX "PracticeAttempt_itemId_attemptNumber_key" ON "PracticeAttempt"("itemId", "attemptNumber");
CREATE TRIGGER immutable_attempt BEFORE UPDATE OR DELETE ON "PracticeAttempt" FOR EACH ROW EXECUTE FUNCTION nexo_d05_immutable();
