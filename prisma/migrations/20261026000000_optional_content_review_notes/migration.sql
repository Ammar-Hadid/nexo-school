-- Ordinary review notes are optional. Keep immutable decisions and publication
-- constraints intact; existing notes and reviews are preserved.
ALTER TABLE "ContentReview" DROP CONSTRAINT "ContentReview_notes_check";
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_notes_check"
  CHECK (length("notes") <= 16000);
