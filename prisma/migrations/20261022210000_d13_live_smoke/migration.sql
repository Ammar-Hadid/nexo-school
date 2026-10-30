-- Preserve the fake policy; admit only the versioned, review-only D13 smoke lane.
ALTER TABLE "GenerationJob" DROP CONSTRAINT "GenerationJob_policyVersion_check";
ALTER TABLE "GenerationJob" DROP CONSTRAINT "GenerationJob_provider_check";
ALTER TABLE "GenerationJob" ADD CONSTRAINT "GenerationJob_provider_policy_check" CHECK (
 ("provider" = 'fake-v1' AND "policyVersion" = 'synthetic-generation-v1') OR
 ("provider" = 'd13-live-smoke-v1' AND "policyVersion" = 'd13-live-smoke-20261022-v1' AND "feature" = 'review')
);
ALTER TABLE "GenerationAttempt" DROP CONSTRAINT "GenerationAttempt_reservedMicroEur_check";
ALTER TABLE "GenerationAttempt" ADD CONSTRAINT "GenerationAttempt_reservation_bound" CHECK ("reservedMicroEur" BETWEEN 1 AND 8000000);
CREATE FUNCTION check_generation_reservation() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE p TEXT;
BEGIN
 SELECT "provider" INTO p FROM "GenerationJob" WHERE "id" = NEW."jobId";
 IF p = 'fake-v1' AND NEW."reservedMicroEur" <> 1000 THEN RAISE EXCEPTION 'Fake reservation must remain 1000'; END IF;
 IF p = 'd13-live-smoke-v1' AND NEW."sequence" <> 1 THEN RAISE EXCEPTION 'Live smoke has no automatic retries'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER check_generation_reservation BEFORE INSERT ON "GenerationAttempt" FOR EACH ROW EXECUTE FUNCTION check_generation_reservation();
