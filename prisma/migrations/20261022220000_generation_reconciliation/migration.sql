CREATE TABLE "GenerationCostReconciliation" (
 "attemptId" TEXT PRIMARY KEY REFERENCES "GenerationAttempt"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
 "costMicroEur" INTEGER NOT NULL CHECK ("costMicroEur" BETWEEN 0 AND 8000000),
 "evidenceHash" TEXT NOT NULL CHECK ("evidenceHash" ~ '^[a-f0-9]{64}$'),
 "note" TEXT NOT NULL CHECK (length(trim("note")) BETWEEN 1 AND 2000),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE FUNCTION reconcile_generation_cost() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE a "GenerationAttempt"%ROWTYPE; p TEXT;
BEGIN
 IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'Reconciliation evidence is immutable'; END IF;
 PERFORM pg_advisory_xact_lock(120012);
 SELECT * INTO a FROM "GenerationAttempt" WHERE "id" = NEW."attemptId";
 SELECT "provider" INTO p FROM "GenerationJob" WHERE "id" = a."jobId";
 IF a."state" IS DISTINCT FROM 'uncertain' OR p IS DISTINCT FROM 'd13-live-smoke-v1'
 OR NEW."costMicroEur" > a."chargedMicroEur" THEN RAISE EXCEPTION 'Invalid reconciliation target or amount'; END IF;
 UPDATE "GenerationBudget" SET "committedMicroEur" = "committedMicroEur" - (a."chargedMicroEur" - NEW."costMicroEur") WHERE "period" = a."period";
 RETURN NEW;
END $$;
CREATE TRIGGER reconcile_generation_cost BEFORE INSERT OR UPDATE OR DELETE ON "GenerationCostReconciliation" FOR EACH ROW EXECUTE FUNCTION reconcile_generation_cost();
