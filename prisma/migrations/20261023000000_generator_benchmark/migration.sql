ALTER TABLE "GenerationJob" DROP CONSTRAINT "GenerationJob_provider_policy_check";
ALTER TABLE "GenerationJob" ADD CONSTRAINT "GenerationJob_provider_policy_check" CHECK (
 ("provider" = 'fake-v1' AND "policyVersion" = 'synthetic-generation-v1') OR
 ("provider" = 'd13-live-smoke-v1' AND "policyVersion" = 'd13-live-smoke-20261022-v1' AND "feature" = 'review') OR
 ("provider" = 'd13-expanded-v2' AND "policyVersion" = 'd13-screen-20261022-v2' AND "feature" = 'review') OR
 ("provider" = 'd13-generator-v1' AND "policyVersion" = 'd13-generator-20261022-v1' AND "feature" IN ('generation','review'))
);
CREATE OR REPLACE FUNCTION check_generation_reservation() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE p TEXT;
BEGIN
 SELECT "provider" INTO p FROM "GenerationJob" WHERE "id" = NEW."jobId";
 IF p = 'fake-v1' AND NEW."reservedMicroEur" <> 1000 THEN RAISE EXCEPTION 'Fake reservation must remain 1000'; END IF;
 IF p IN ('d13-live-smoke-v1','d13-expanded-v2','d13-generator-v1') AND NEW."sequence" <> 1 THEN RAISE EXCEPTION 'Live benchmark has no automatic retries'; END IF;
 RETURN NEW;
END $$;
