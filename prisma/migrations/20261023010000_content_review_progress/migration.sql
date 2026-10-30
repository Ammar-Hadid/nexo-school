CREATE TABLE "ContentReviewProgress" (
 "reviewerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
 "batchId" TEXT NOT NULL,
 "cursor" TEXT,
 "totalMs" INTEGER NOT NULL DEFAULT 0 CHECK ("totalMs" >= 0),
 "sessionId" TEXT,
 "sessionMs" INTEGER NOT NULL DEFAULT 0 CHECK ("sessionMs" >= 0),
 "sequence" INTEGER NOT NULL DEFAULT 0 CHECK ("sequence" >= 0),
 "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "lastPulseAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY ("reviewerId", "batchId")
);
