CREATE TABLE "FamilyReviewDraft" (
 "reviewerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
 "packageHash" TEXT NOT NULL CHECK ("packageHash" ~ '^[a-f0-9]{64}$'),
 "revision" INTEGER NOT NULL CHECK ("revision">0),
 "lastAction" TEXT NOT NULL CHECK ("lastAction" IN ('save','record')),
 "snapshot" TEXT NOT NULL,
 PRIMARY KEY ("reviewerId","packageHash")
);
CREATE TABLE "FamilyReviewDecision" (
 "id" TEXT PRIMARY KEY,
 "reviewerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
 "packageHash" TEXT NOT NULL CHECK ("packageHash" ~ '^[a-f0-9]{64}$'),
 "revision" INTEGER NOT NULL CHECK ("revision">0),
 "outcome" TEXT NOT NULL CHECK ("outcome" IN ('guardian-feedback','provisional','educator-approved','changes-required','unresolved')),
 "snapshot" TEXT NOT NULL,
 "packageSnapshot" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE ("reviewerId","packageHash","revision")
);
CREATE FUNCTION reject_family_decision_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Family review decisions are immutable; append a new judgment'; END;
$$;
CREATE TRIGGER family_decision_immutable BEFORE UPDATE OR DELETE ON "FamilyReviewDecision" FOR EACH ROW EXECUTE FUNCTION reject_family_decision_change();
