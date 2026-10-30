import { describe, expect, it } from 'vitest';
import {
  permitsStudentAccess,
  type IdentityActor,
  type StudentCapability,
} from './authorization';
const now = new Date('2026-10-20T12:00:00Z');
const adult: IdentityActor = {
  kind: 'adult',
  userId: 'guardian-a',
  mfaVerifiedAt: now,
};
const link = {
  guardianId: adult.userId,
  revokedAt: null,
  canView: true,
  canAssign: true,
  canManage: true,
};
const capabilities: StudentCapability[] = [
  'view',
  'assign',
  'manage',
  'practice',
];
describe('explicit student resource capabilities', () => {
  it('separates student self access from guardian and other student authority', () => {
    const student: IdentityActor = { kind: 'student', userId: 'student-a' };
    expect(
      capabilities.map((c) =>
        permitsStudentAccess(student, 'student-a', link, c, now),
      ),
    ).toEqual([true, false, false, true]);
    expect(
      capabilities.map((c) =>
        permitsStudentAccess(student, 'student-b', link, c, now),
      ),
    ).toEqual([false, false, false, false]);
    expect(
      capabilities.map((c) =>
        permitsStudentAccess(adult, 'student-a', link, c, now),
      ),
    ).toEqual([true, true, true, false]);
  });
  it('denies missing, revoked and another guardian links, without role shortcuts', () => {
    for (const relationship of [
      null,
      { ...link, revokedAt: now },
      { ...link, guardianId: 'other' },
    ])
      for (const capability of capabilities)
        expect(
          permitsStudentAccess(
            adult,
            'student-a',
            relationship,
            capability,
            now,
          ),
        ).toBe(false);
  });
  it('checks each capability independently and requires recent non-future MFA for management', () => {
    const restricted = {
      ...link,
      canView: false,
      canAssign: false,
      canManage: false,
    };
    for (const capability of capabilities)
      expect(
        permitsStudentAccess(adult, 'student-a', restricted, capability, now),
      ).toBe(false);
    for (const offset of [-300_001, 1]) {
      const actor = {
        ...adult,
        mfaVerifiedAt: new Date(now.getTime() + offset),
      };
      expect(
        permitsStudentAccess(actor, 'student-a', link, 'manage', now),
      ).toBe(false);
      expect(permitsStudentAccess(actor, 'student-a', link, 'view', now)).toBe(
        true,
      );
    }
  });
});
