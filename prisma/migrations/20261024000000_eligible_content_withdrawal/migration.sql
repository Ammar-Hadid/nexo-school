ALTER TABLE "AssignmentItem" ALTER COLUMN "questionVersionId" DROP NOT NULL;
ALTER TABLE "AssignmentItem"
 ADD COLUMN "contentVersionId" TEXT,
 ADD COLUMN "contentHash" TEXT,
 ADD COLUMN "familyId" TEXT,
 ADD COLUMN "exposureKey" TEXT,
 ADD COLUMN "purpose" TEXT,
 ADD CONSTRAINT assignment_source CHECK (
  ("questionVersionId" IS NOT NULL AND "contentVersionId" IS NULL AND "contentHash" IS NULL AND "familyId" IS NULL AND "exposureKey" IS NULL AND "purpose" IS NULL) OR
  ("questionVersionId" IS NULL AND "contentVersionId" IS NOT NULL AND "contentHash" IS NOT NULL AND length("familyId") > 0 AND "familyId" IS NOT NULL AND length("exposureKey") > 0 AND "exposureKey" IS NOT NULL AND "purpose" = 'practice' AND "purpose" IS NOT NULL)),
 ADD CONSTRAINT "AssignmentItem_content_fkey" FOREIGN KEY ("contentVersionId", "contentHash") REFERENCES "ContentVersion" (id, "contentHash") ON DELETE RESTRICT ON UPDATE RESTRICT;
CREATE UNIQUE INDEX "AssignmentItem_assignmentId_contentVersionId_key" ON "AssignmentItem"("assignmentId", "contentVersionId");
CREATE INDEX "AssignmentItem_contentVersionId_idx" ON "AssignmentItem"("contentVersionId");
CREATE INDEX "AssignmentItem_exposureKey_idx" ON "AssignmentItem"("exposureKey");
CREATE TABLE "ContentWithdrawal" (
 id TEXT PRIMARY KEY,
 "contentVersionId" TEXT NOT NULL UNIQUE,
 "contentHash" TEXT NOT NULL,
 reason TEXT NOT NULL CHECK (reason IN ('incorrect-answer', 'misleading-explanation', 'unsuitable-content', 'other-defect')),
 note TEXT NOT NULL CHECK (length(btrim(note)) BETWEEN 1 AND 2000),
 "actorId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY ("contentVersionId", "contentHash") REFERENCES "ContentVersion"(id, "contentHash") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX "ContentWithdrawal_contentVersionId_contentHash_key" ON "ContentWithdrawal"("contentVersionId", "contentHash");
CREATE TABLE "ContentCorrection" (
 id TEXT PRIMARY KEY,
 "withdrawalId" TEXT NOT NULL UNIQUE REFERENCES "ContentWithdrawal"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
 "replacementVersionId" TEXT NOT NULL,
 "replacementHash" TEXT NOT NULL,
 note TEXT NOT NULL CHECK (length(btrim(note)) BETWEEN 1 AND 2000),
 "actorId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY ("replacementVersionId", "replacementHash") REFERENCES "ContentVersion"(id, "contentHash") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE TRIGGER immutable_withdrawal BEFORE UPDATE OR DELETE ON "ContentWithdrawal" FOR EACH ROW EXECUTE FUNCTION nexo_d05_immutable();
CREATE TRIGGER immutable_correction BEFORE UPDATE OR DELETE ON "ContentCorrection" FOR EACH ROW EXECUTE FUNCTION nexo_d05_immutable();
-- One small-app content lifecycle lock. Protects even trusted SQL writers from issue/withdraw races.
CREATE FUNCTION nexo_content_lock() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_advisory_xact_lock(78210415); RETURN NEW; END $$;
CREATE TRIGGER content_version_lock BEFORE INSERT ON "ContentVersion" FOR EACH ROW EXECUTE FUNCTION nexo_content_lock();
CREATE TRIGGER content_rubric_lock BEFORE INSERT ON "ContentRubricVersion" FOR EACH ROW EXECUTE FUNCTION nexo_content_lock();
CREATE TRIGGER content_withdrawal_lock BEFORE INSERT ON "ContentWithdrawal" FOR EACH ROW EXECUTE FUNCTION nexo_content_lock();
CREATE FUNCTION nexo_eligible_publication(target TEXT) RETURNS BOOLEAN LANGUAGE sql AS $$
 SELECT EXISTS (
  SELECT 1 FROM "ContentVersion" v
  JOIN "ContentRubricVersion" r ON r.id = v."rubricVersionId" AND r."contentHash" = v."rubricHash"
  JOIN "ContentReview" a ON a."contentVersionId" = v.id AND a."contentHash" = v."contentHash" AND a.decision = 'approved' AND a.authority = 'human-content-review'
  JOIN "ContentPublication" p ON p."reviewId" = a.id AND p.scope = 'local-synthetic-practice'
  WHERE v.id = target
   AND NOT EXISTS (SELECT 1 FROM "ContentWithdrawal" w WHERE w."contentVersionId" = v.id)
   AND NOT EXISTS (SELECT 1 FROM "ContentVersion" newer WHERE newer."contentId" = v."contentId" AND newer.revision > v.revision)
   AND NOT EXISTS (SELECT 1 FROM "ContentRubricVersion" newer WHERE newer."rubricId" = r."rubricId" AND newer.revision > r.revision)
 )
$$;
CREATE FUNCTION nexo_assignment_content_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(78210415);
 IF NEW."contentVersionId" IS NOT NULL AND NOT nexo_eligible_publication(NEW."contentVersionId") THEN RAISE EXCEPTION 'Content is not assignable'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER assignment_content_guard BEFORE INSERT ON "AssignmentItem" FOR EACH ROW EXECUTE FUNCTION nexo_assignment_content_guard();
CREATE FUNCTION nexo_withdrawn_work_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(78210415);
 IF EXISTS (SELECT 1 FROM "AssignmentItem" i JOIN "ContentWithdrawal" w ON w."contentVersionId" = i."contentVersionId" WHERE i."assignmentId" = NEW."assignmentId") THEN RAISE EXCEPTION 'Assignment paused by content withdrawal'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER withdrawn_attempt_guard BEFORE INSERT ON "PracticeAttempt" FOR EACH ROW EXECUTE FUNCTION nexo_withdrawn_work_guard();
CREATE TRIGGER withdrawn_presentation_guard BEFORE INSERT OR UPDATE ON "PracticePresentation" FOR EACH ROW EXECUTE FUNCTION nexo_withdrawn_work_guard();
CREATE FUNCTION nexo_publication_withdrawal_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(78210415);
 IF EXISTS (SELECT 1 FROM "ContentWithdrawal" WHERE "contentVersionId" = NEW."contentVersionId") THEN RAISE EXCEPTION 'Withdrawn content'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER withdrawn_publication_guard BEFORE INSERT ON "ContentPublication" FOR EACH ROW EXECUTE FUNCTION nexo_publication_withdrawal_guard();
CREATE FUNCTION nexo_correction_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(78210415);
 IF NOT nexo_eligible_publication(NEW."replacementVersionId") OR NOT EXISTS (
  SELECT 1 FROM "ContentWithdrawal" w JOIN "ContentVersion" prior_version ON prior_version.id = w."contentVersionId"
  JOIN "ContentVersion" fresh ON fresh.id = NEW."replacementVersionId"
  WHERE w.id = NEW."withdrawalId" AND prior_version."contentId" = fresh."contentId" AND prior_version."coverageId" = fresh."coverageId" AND fresh.revision > prior_version.revision
 ) THEN RAISE EXCEPTION 'Invalid reviewed correction'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER correction_guard BEFORE INSERT ON "ContentCorrection" FOR EACH ROW EXECUTE FUNCTION nexo_correction_guard();
CREATE TRIGGER withdrawn_review_guard BEFORE INSERT ON "ContentReview" FOR EACH ROW EXECUTE FUNCTION nexo_publication_withdrawal_guard();
-- Add the bounded Spelling adapter without weakening the original integer contract.
ALTER TABLE "PracticeAttempt" DROP CONSTRAINT "PracticeAttempt_normalizedAnswer_check", DROP CONSTRAINT "PracticeAttempt_evaluatorVersion_check";
ALTER TABLE "PracticeAttempt" ADD CONSTRAINT "PracticeAttempt_evaluation_contract" CHECK (
 ("evaluatorVersion" = 'integer-exact-v1' AND "normalizedAnswer" ~ '^(0|[1-9][0-9]{0,5})$') OR
 ("evaluatorVersion" = 'spelling-doubling-v1' AND length("normalizedAnswer") BETWEEN 1 AND 40)
);
