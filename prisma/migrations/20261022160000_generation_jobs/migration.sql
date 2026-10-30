CREATE TABLE "GenerationJob" (
 "id" TEXT PRIMARY KEY, "requestId" TEXT NOT NULL UNIQUE,
 "requestHash" TEXT NOT NULL CHECK ("requestHash" ~ '^[a-f0-9]{64}$'),
 "specification" TEXT NOT NULL CHECK (length("specification") BETWEEN 1 AND 8000),
 "feature" TEXT NOT NULL CHECK ("feature" IN ('generation','review','feedback')),
 "policyVersion" TEXT NOT NULL CHECK ("policyVersion" = 'synthetic-generation-v1'),
 "provider" TEXT NOT NULL CHECK ("provider" = 'fake-v1'),
 "state" TEXT NOT NULL DEFAULT 'queued' CHECK ("state" IN ('queued','running','succeeded','failed')),
 "attempts" INTEGER NOT NULL DEFAULT 0 CHECK ("attempts" BETWEEN 0 AND 3),
 "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "result" TEXT, "resultHash" TEXT,
 CHECK (("state" = 'succeeded' AND "result" IS NOT NULL AND "resultHash" IS NOT NULL)
 OR ("state" <> 'succeeded' AND "result" IS NULL AND "resultHash" IS NULL)),
 CHECK ("result" IS NULL OR (length("result") <= 16000 AND "resultHash" = encode(sha256(convert_to("result", 'UTF8')), 'hex')))
);
CREATE TABLE "GenerationBudget" (
 "period" TEXT PRIMARY KEY CHECK ("period" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
 "capMicroEur" INTEGER NOT NULL CHECK ("capMicroEur" BETWEEN 0 AND 10000000),
 "committedMicroEur" INTEGER NOT NULL DEFAULT 0 CHECK ("committedMicroEur" >= 0 AND "committedMicroEur" <= "capMicroEur")
);
CREATE TABLE "GenerationAttempt" (
 "id" TEXT PRIMARY KEY,
 "jobId" TEXT NOT NULL REFERENCES "GenerationJob"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
 "sequence" INTEGER NOT NULL CHECK ("sequence" BETWEEN 1 AND 3),
 "period" TEXT NOT NULL REFERENCES "GenerationBudget"("period") ON DELETE RESTRICT ON UPDATE RESTRICT,
 "leaseUntil" TIMESTAMP(3) NOT NULL,
 "state" TEXT NOT NULL DEFAULT 'reserved' CHECK ("state" IN ('reserved','settled','uncertain')),
 "reservedMicroEur" INTEGER NOT NULL CHECK ("reservedMicroEur" = 1000),
 "chargedMicroEur" INTEGER,
 "inputTokens" INTEGER CHECK ("inputTokens" >= 0),
 "outputTokens" INTEGER CHECK ("outputTokens" >= 0),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE ("jobId", "sequence"),
 CHECK (("state" = 'reserved' AND "chargedMicroEur" IS NULL AND "inputTokens" IS NULL AND "outputTokens" IS NULL)
 OR ("state" = 'uncertain' AND "chargedMicroEur" IS NOT NULL AND "chargedMicroEur" = "reservedMicroEur" AND "inputTokens" IS NULL AND "outputTokens" IS NULL)
 OR ("state" = 'settled' AND "chargedMicroEur" IS NOT NULL AND "chargedMicroEur" BETWEEN 0 AND "reservedMicroEur" AND "inputTokens" IS NOT NULL AND "outputTokens" IS NOT NULL))
);
CREATE FUNCTION protect_generation_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Generation history is retained'; END IF;
 IF TG_TABLE_NAME = 'GenerationJob' THEN
  IF OLD."state" IN ('succeeded','failed') OR
   (to_jsonb(OLD) - ARRAY['state','attempts','availableAt','result','resultHash']) IS DISTINCT FROM
   (to_jsonb(NEW) - ARRAY['state','attempts','availableAt','result','resultHash'])
  THEN RAISE EXCEPTION 'Generation job identity or terminal state is immutable'; END IF;
 ELSIF TG_TABLE_NAME = 'GenerationAttempt' THEN
  IF OLD."state" <> 'reserved' OR
   (to_jsonb(OLD) - ARRAY['state','chargedMicroEur','inputTokens','outputTokens']) IS DISTINCT FROM
   (to_jsonb(NEW) - ARRAY['state','chargedMicroEur','inputTokens','outputTokens'])
  THEN RAISE EXCEPTION 'Generation attempt identity or settlement is immutable'; END IF;
 ELSE
  IF OLD."period" <> NEW."period" OR OLD."capMicroEur" <> NEW."capMicroEur"
  THEN RAISE EXCEPTION 'Monthly budget configuration is immutable'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER protect_generation_job BEFORE UPDATE OR DELETE ON "GenerationJob" FOR EACH ROW EXECUTE FUNCTION protect_generation_history();
CREATE TRIGGER protect_generation_attempt BEFORE UPDATE OR DELETE ON "GenerationAttempt" FOR EACH ROW EXECUTE FUNCTION protect_generation_history();
CREATE TRIGGER protect_generation_budget BEFORE UPDATE OR DELETE ON "GenerationBudget" FOR EACH ROW EXECUTE FUNCTION protect_generation_history();
