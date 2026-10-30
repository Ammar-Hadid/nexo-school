CREATE TABLE "PracticePresentation" (
 "assignmentId" TEXT PRIMARY KEY REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
 "version" INTEGER NOT NULL DEFAULT 0 CHECK ("version" >= 0),
 "progressRevision" INTEGER NOT NULL DEFAULT 0 CHECK ("progressRevision" BETWEEN 0 AND 20),
 "acknowledgedRevision" INTEGER NOT NULL DEFAULT 0 CHECK ("acknowledgedRevision" BETWEEN 0 AND "progressRevision"),
 "answer" TEXT NOT NULL DEFAULT '' CHECK (length("answer") <= 64),
 "requestId" TEXT
);
