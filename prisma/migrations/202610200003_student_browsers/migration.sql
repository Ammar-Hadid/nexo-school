CREATE TABLE "Passkey" (
  "id" TEXT PRIMARY KEY, "name" TEXT, "publicKey" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE RESTRICT,
  "credentialID" TEXT NOT NULL UNIQUE, "counter" INTEGER NOT NULL,
  "deviceType" TEXT NOT NULL, "backedUp" BOOLEAN NOT NULL,
  "transports" TEXT, "createdAt" TIMESTAMP(3), "aaguid" TEXT
);
CREATE INDEX "Passkey_userId_idx" ON "Passkey"("userId");
CREATE TABLE "StudentBrowser" (
  "id" TEXT PRIMARY KEY, "secretHash" TEXT NOT NULL UNIQUE, "label" TEXT NOT NULL,
  "studentId" TEXT REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  "approvedBy" TEXT, "state" TEXT NOT NULL DEFAULT 'pending',
  "enrollExpires" TIMESTAMP(3) NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
  "credentialID" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentBrowser_state_check" CHECK ("state" IN ('pending','approved','registering','active','revoked')),
  CONSTRAINT "StudentBrowser_approval_check" CHECK ("state" IN ('pending','revoked') OR ("studentId" IS NOT NULL AND "approvedBy" IS NOT NULL)),
  CONSTRAINT "StudentBrowser_credential_check" CHECK ("state" NOT IN ('registering','active') OR "credentialID" IS NOT NULL)
);
CREATE INDEX "StudentBrowser_studentId_idx" ON "StudentBrowser"("studentId");
CREATE TABLE "StudentSessionBinding" (
  "sessionId" TEXT PRIMARY KEY REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE RESTRICT,
  "browserId" TEXT NOT NULL REFERENCES "StudentBrowser"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "StudentSessionBinding_browserId_idx" ON "StudentSessionBinding"("browserId");
