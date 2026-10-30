-- Extend the finite evaluator allowlist. Existing attempts, scores, accounts and
-- immutable content remain untouched; original integer/Spelling rules remain.
ALTER TABLE "PracticeAttempt" DROP CONSTRAINT "PracticeAttempt_evaluation_contract";
ALTER TABLE "PracticeAttempt" ADD CONSTRAINT "PracticeAttempt_evaluation_contract" CHECK (
 ("evaluatorVersion" IN ('integer-exact-v1', 'redactiesommen-integer-v1') AND "normalizedAnswer" ~ '^(0|[1-9][0-9]{0,5})$') OR
 ("evaluatorVersion" = 'spelling-doubling-v1' AND length("normalizedAnswer") BETWEEN 1 AND 40) OR
 ("evaluatorVersion" = 'taal-word-exact-v1' AND "normalizedAnswer" ~ '^[[:alpha:]]{1,40}$') OR
 ("evaluatorVersion" = 'reading-choice-exact-v1' AND "normalizedAnswer" ~ '^[a-d]$')
);
