-- D10 is additive: D05 assignments and their pinned synthetic seed remain untouched.
CREATE TABLE "CoverageObjective" (
 "id" TEXT PRIMARY KEY, "release" TEXT NOT NULL, "code" TEXT NOT NULL,
 "subject" TEXT NOT NULL CHECK ("subject" IN ('Rekenen','Taal','Spelling','Begrijpend Lezen')),
 "category" TEXT NOT NULL, "label" TEXT NOT NULL, "specification" TEXT NOT NULL,
 "contentHash" TEXT NOT NULL,
 CONSTRAINT coverage_hash CHECK ("contentHash" = encode(sha256(convert_to("specification", 'UTF8')), 'hex')),
 CONSTRAINT coverage_identity CHECK (("specification"::jsonb->>'id') IS NOT DISTINCT FROM "id" AND ("specification"::jsonb->>'release') IS NOT DISTINCT FROM "release" AND ("specification"::jsonb->>'code') IS NOT DISTINCT FROM "code" AND ("specification"::jsonb->>'subject') IS NOT DISTINCT FROM "subject" AND ("specification"::jsonb->>'category') IS NOT DISTINCT FROM "category" AND ("specification"::jsonb->>'label') IS NOT DISTINCT FROM "label")
);
CREATE UNIQUE INDEX "CoverageObjective_release_code_key" ON "CoverageObjective" ("release", "code");
CREATE TABLE "ContentRubricVersion" (
 "id" TEXT PRIMARY KEY, "rubricId" TEXT NOT NULL, "revision" INTEGER NOT NULL CHECK ("revision" > 0),
 "snapshot" TEXT NOT NULL, "contentHash" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT rubric_hash CHECK ("contentHash" = encode(sha256(convert_to("snapshot", 'UTF8')), 'hex')),
 CONSTRAINT rubric_identity CHECK (("snapshot"::jsonb->>'rubricId') IS NOT DISTINCT FROM "rubricId" AND ("snapshot"::jsonb->>'revision') IS NOT DISTINCT FROM "revision"::text)
);
CREATE UNIQUE INDEX "ContentRubricVersion_rubricId_revision_key" ON "ContentRubricVersion" ("rubricId", "revision");
CREATE UNIQUE INDEX "ContentRubricVersion_id_contentHash_key" ON "ContentRubricVersion" ("id", "contentHash");
CREATE TABLE "ContentVersion" (
 "id" TEXT PRIMARY KEY, "contentId" TEXT NOT NULL, "revision" INTEGER NOT NULL CHECK ("revision" > 0),
 "coverageId" TEXT NOT NULL REFERENCES "CoverageObjective" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
 "rubricVersionId" TEXT NOT NULL, "rubricHash" TEXT NOT NULL,
 "snapshot" TEXT NOT NULL, "contentHash" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT content_rubric FOREIGN KEY ("rubricVersionId", "rubricHash") REFERENCES "ContentRubricVersion" ("id", "contentHash") ON DELETE RESTRICT ON UPDATE RESTRICT,
 CONSTRAINT content_hash CHECK ("contentHash" = encode(sha256(convert_to("snapshot", 'UTF8')), 'hex')),
 CONSTRAINT content_identity CHECK (("snapshot"::jsonb->>'contentId') IS NOT DISTINCT FROM "contentId" AND ("snapshot"::jsonb->>'revision') IS NOT DISTINCT FROM "revision"::text AND ("snapshot"::jsonb->>'coverageId') IS NOT DISTINCT FROM "coverageId" AND ("snapshot"::jsonb->>'rubricVersionId') IS NOT DISTINCT FROM "rubricVersionId" AND ("snapshot"::jsonb->>'rubricHash') IS NOT DISTINCT FROM "rubricHash")
);
CREATE UNIQUE INDEX "ContentVersion_contentId_revision_key" ON "ContentVersion" ("contentId", "revision");
CREATE UNIQUE INDEX "ContentVersion_id_contentHash_key" ON "ContentVersion" ("id", "contentHash");
CREATE TABLE "ContentReview" (
 "id" TEXT PRIMARY KEY, "contentVersionId" TEXT NOT NULL, "contentHash" TEXT NOT NULL,
 "decision" TEXT NOT NULL CHECK ("decision" IN ('approved','rejected')),
 "reviewerId" TEXT NOT NULL REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
 "notes" TEXT NOT NULL CHECK (length(btrim("notes")) > 0),
 "authority" TEXT NOT NULL DEFAULT 'human-content-review' CHECK ("authority" = 'human-content-review'),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT review_content FOREIGN KEY ("contentVersionId", "contentHash") REFERENCES "ContentVersion" ("id", "contentHash") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX "ContentReview_contentVersionId_key" ON "ContentReview" ("contentVersionId");
CREATE UNIQUE INDEX "ContentReview_id_contentVersionId_contentHash_decision_key" ON "ContentReview" ("id", "contentVersionId", "contentHash", "decision");
CREATE TABLE "ContentPublication" (
 "id" TEXT PRIMARY KEY, "contentVersionId" TEXT NOT NULL, "contentHash" TEXT NOT NULL, "reviewId" TEXT NOT NULL,
 "decision" TEXT NOT NULL DEFAULT 'approved' CHECK ("decision" = 'approved'),
 "scope" TEXT NOT NULL DEFAULT 'local-synthetic-practice' CHECK ("scope" = 'local-synthetic-practice'),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT publication_review FOREIGN KEY ("reviewId", "contentVersionId", "contentHash", "decision") REFERENCES "ContentReview" ("id", "contentVersionId", "contentHash", "decision") ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE UNIQUE INDEX "ContentPublication_contentVersionId_key" ON "ContentPublication" ("contentVersionId");
CREATE UNIQUE INDEX "ContentPublication_reviewId_key" ON "ContentPublication" ("reviewId");
CREATE FUNCTION nexo_d10_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Immutable D10 record; create a new revision'; END $$;
CREATE TRIGGER immutable_coverage BEFORE UPDATE OR DELETE ON "CoverageObjective" FOR EACH ROW EXECUTE FUNCTION nexo_d10_immutable();
CREATE TRIGGER immutable_rubric BEFORE UPDATE OR DELETE ON "ContentRubricVersion" FOR EACH ROW EXECUTE FUNCTION nexo_d10_immutable();
CREATE TRIGGER immutable_content BEFORE UPDATE OR DELETE ON "ContentVersion" FOR EACH ROW EXECUTE FUNCTION nexo_d10_immutable();
CREATE TRIGGER immutable_review BEFORE UPDATE OR DELETE ON "ContentReview" FOR EACH ROW EXECUTE FUNCTION nexo_d10_immutable();
CREATE TRIGGER immutable_publication BEFORE UPDATE OR DELETE ON "ContentPublication" FOR EACH ROW EXECUTE FUNCTION nexo_d10_immutable();

CREATE UNIQUE INDEX "ContentReview_contentVersionId_contentHash_key" ON "ContentReview" ("contentVersionId", "contentHash");
CREATE UNIQUE INDEX "publication_review_version_hash_decision_key" ON "ContentPublication" ("reviewId", "contentVersionId", "contentHash", "decision");
