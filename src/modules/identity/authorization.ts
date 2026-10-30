/** Produced only by a trusted session adapter, never from request JSON/headers. */
export type IdentityActor =
  | { kind: 'adult'; userId: string; mfaVerifiedAt: Date }
  | { kind: 'student'; userId: string };

export type StudentCapability = 'view' | 'assign' | 'manage' | 'practice';
export type Supervision = {
  guardianId: string;
  revokedAt: Date | null;
  canView: boolean;
  canAssign: boolean;
  canManage: boolean;
};

export function permitsStudentAccess(
  actor: IdentityActor,
  studentUserId: string,
  relationship: Supervision | null,
  capability: StudentCapability,
  now = new Date(),
): boolean {
  if (actor.kind === 'student')
    return (
      actor.userId === studentUserId &&
      (capability === 'view' || capability === 'practice')
    );
  if (
    !relationship ||
    relationship.guardianId !== actor.userId ||
    relationship.revokedAt !== null
  )
    return false;
  switch (capability) {
    case 'view':
      return relationship.canView;
    case 'assign':
      return relationship.canAssign;
    case 'manage': {
      const age = now.getTime() - actor.mfaVerifiedAt.getTime();
      return relationship.canManage && age >= 0 && age <= 5 * 60_000;
    }
    case 'practice':
      return false;
  }
}
