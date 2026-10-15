# Human device test record

**Status: NOT RUN on physical authenticators as of 15 October 2026.** The current MacBook Chrome can load the public HTTPS page and reports a secure context/WebAuthn API. That does not prove Touch ID, passkey-manager integration or tablet compatibility.

Use only the trial identities. Do not record passwords, TOTP secrets, recovery codes, OS PINs, session/browser cookies or private keys. Record screenshots only after hiding setup secrets.

## Environment to record

| Field | Tab S9 Ultra | MacBook Chrome | MacBook Safari |
|---|---|---|---|
| Hardware | Samsung Tab S9 Ultra | 16-inch M4 Pro MacBook | Same MacBook |
| OS version | Pending | Pending | Pending |
| Browser version | Pending | Pending | Pending |
| Screen lock enabled / unlock method | Pending (method only; never PIN) | Pending | Pending |
| Passkey manager/provider | Pending | Pending | Pending |
| Sync enabled / shared OS or account | Pending (no account addresses needed) | Pending | Pending |
| Normal/private profile | Normal required initially | Separate student profile recommended | Normal required initially |
| Local/platform vs cross-device QR/security key | Record actual route taken | Record actual route taken | Record actual route taken |

## Run in this order

For each test record **pass / fail / not run**, device/browser, time and a short observation. A cancelled prompt is not a server verification failure; distinguish them.

| ID | Action | Required result | Hardware result |
|---|---|---|---|
| H01 | Guardian password login, test TOTP enrollment and verification on MacBook Chrome | Password alone cannot approve; valid TOTP enables approval | Not run |
| H02 | Request enrollment on tablet; inspect and approve code on MacBook | Correct browser label and synthetic student; ten-minute expiry | Not run |
| H03 | Create student passkey on tablet | OS lock/biometric prompt succeeds; registration is allowed only after approval | Not run |
| H04 | Sign in with passkey; check student access | Test Student only, no guardian controls authorized | Not run |
| H05 | Sign out, close all Chrome windows, reopen, then sign in | Browser approval survives; child completes sign-in without guardian | Not run |
| H06 | Close/reopen while signed in | Valid student session resumes within limits; no elevation | Not run |
| H07 | Cancel passkey prompt, then retry normally | Cancellation gives a recoverable error; no new session from cancellation | Not run |
| H08 | Open a fresh browser/profile with a synced key, before approval | Sign-in denied despite availability of the key | Not run |
| H09 | Approve that new browser; select Sign in with passkey | Existing synced key can be associated after approval and verification | Not run |
| H10 | MacBook student enrollment/login in Chrome and Safari, guardian in a different browser | Record actual provider and prompts; do not assume browser passkey stores are interchangeable | Not run |
| H11 | Guardian revokes just the tablet browser while it is signed in | Next Check student access fails; another approved browser continues | Not run |
| H12 | Guardian revokes the credential used on multiple approved browsers | Every copy and associated session loses access | Not run |
| H13 | Clear site cookies in a disposable student profile | Existing passkey cannot bypass lost browser approval | Not run |
| H14 | Repeat enrollment on that profile; approve and use existing/new key | Access recovered for the same synthetic student; no weak PIN fallback | Not run |
| H15 | Leave an approved code unused for ten minutes; attempt registration | Expired approval denied; request a new enrollment | Not run |
| H16 | Leave guardian without TOTP verification for over five minutes; try revoke/approve | Step-up required; valid TOTP restores ability | Not run |
| H17 | Leave student without protected requests for over 30 minutes | Student check locks; sign out, then independent passkey sign-in restores access | Not run |
| H18 | If already available, test a security key that supports user verification | Same approval policy and UV requirement; no purchase assumed | Not run / optional |
| H19 | Revoke all student access | Every student session/grant/key is denied; guardian still works | Not run |

Keep the page idle during H17; refreshing status counts as activity. For a cross-device QR flow, record the assisting device and whether the child could repeat it independently. A flow requiring the guardian's phone every morning does not meet the independent-access requirement even if WebAuthn technically succeeds.

## Decision rule

Do not mark the feasibility spike passed until the tablet can independently sign in on its approved normal Chrome profile and the guardian MacBook flow works, including physical-browser revocation/recovery checks. Chrome and Safari results must be recorded individually. A negative result should retain the full symptom and stage (prompt, registration, assertion, approval, session) without secrets. Revisit the auth choice if supported hooks or practical device UX cannot meet the requirements. Automated Chromium results cannot replace this evidence.

Passing this spike authorizes no broader implementation by itself; the user's current scope remains authentication only.
