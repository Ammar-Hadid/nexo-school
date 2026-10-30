-- Role-specific composite FKs prevent an adult becoming a student profile or a
-- student becoming a guardian, including through direct database writes.
ALTER TABLE "User" ADD CONSTRAINT "User_principalKind_check"
  CHECK ("principalKind" IN ('adult', 'student'));
CREATE UNIQUE INDEX "User_id_principalKind_key" ON "User"("id", "principalKind");

CREATE TABLE "Student" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "principalKind" TEXT NOT NULL DEFAULT 'student' CHECK ("principalKind" = 'student'),
  "displayName" TEXT NOT NULL CHECK (length(btrim("displayName")) BETWEEN 1 AND 100),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId", "principalKind") REFERENCES "User"("id", "principalKind")
    ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE TABLE "GuardianStudent" (
  "guardianId" TEXT NOT NULL,
  "principalKind" TEXT NOT NULL DEFAULT 'adult' CHECK ("principalKind" = 'adult'),
  "studentId" TEXT NOT NULL,
  "canView" BOOLEAN NOT NULL DEFAULT false,
  "canAssign" BOOLEAN NOT NULL DEFAULT false,
  "canManage" BOOLEAN NOT NULL DEFAULT false,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("guardianId", "studentId"),
  FOREIGN KEY ("guardianId", "principalKind") REFERENCES "User"("id", "principalKind")
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY ("studentId") REFERENCES "Student"("id")
    ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX "GuardianStudent_studentId_idx" ON "GuardianStudent"("studentId");
CREATE UNIQUE INDEX "Student_userId_principalKind_key" ON "Student"("userId", "principalKind");
ALTER TABLE "IdentityAudit" ADD COLUMN "studentId" TEXT;
