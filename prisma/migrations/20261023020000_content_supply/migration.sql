CREATE TABLE "ContentSupplyWeek" (
 "policyVersion" TEXT NOT NULL DEFAULT 'd14-optellen-supply-v1',
 "reviewerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
 "week" TEXT NOT NULL CHECK ("week" ~ '^\d{4}-\d{2}-\d{2}$'),
 "demand" INTEGER NOT NULL CHECK ("demand" BETWEEN 1 AND 600),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY ("reviewerId","week")
);
CREATE TABLE "ContentSupplyAdmission" (
 "id" TEXT PRIMARY KEY,
 "reviewerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
 "week" TEXT NOT NULL CHECK ("week" ~ '^\d{4}-\d{2}-\d{2}$'),
 "contentVersionId" TEXT NOT NULL,
 "contentHash" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY ("contentVersionId","contentHash") REFERENCES "ContentVersion"("id","contentHash") ON DELETE RESTRICT ON UPDATE RESTRICT,
 UNIQUE ("reviewerId","contentVersionId")
);
CREATE INDEX "ContentSupplyAdmission_reviewerId_week_idx" ON "ContentSupplyAdmission"("reviewerId","week");
CREATE TABLE "ContentSupplyReservation" (
 "id" TEXT PRIMARY KEY,
 "reviewerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
 "week" TEXT NOT NULL CHECK ("week" ~ '^\d{4}-\d{2}-\d{2}$'),
 "contentVersionId" TEXT NOT NULL,
 "contentHash" TEXT NOT NULL,
 "exposureKey" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY ("contentVersionId","contentHash") REFERENCES "ContentVersion"("id","contentHash") ON DELETE RESTRICT ON UPDATE RESTRICT,
 UNIQUE ("reviewerId","week","exposureKey")
);
CREATE FUNCTION reject_supply_history_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Supply admission/reservation history is immutable'; END;
$$;
CREATE TRIGGER supply_admission_immutable BEFORE UPDATE OR DELETE ON "ContentSupplyAdmission" FOR EACH ROW EXECUTE FUNCTION reject_supply_history_change();
CREATE TRIGGER supply_reservation_immutable BEFORE UPDATE OR DELETE ON "ContentSupplyReservation" FOR EACH ROW EXECUTE FUNCTION reject_supply_history_change();
