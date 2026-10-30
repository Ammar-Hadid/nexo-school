# Human device test record

**Status: core tablet/guardian flow demonstrated; full physical-device checklist incomplete as of 16 October 2026.** Evidence below is user-reported guided testing, with screenshots for some tablet states; it is not an independently observed hardware audit. Adam can now sign in on Tab S9 Ultra/Chrome using his known PIN without the guardian fingerprint. MacBook Chrome guardian password/TOTP, enrollment approval, tablet revocation and recovery were exercised. Safari remains untested; the user explicitly skipped further Safari testing for this spike on 16 October 2026. Exact test times and OS/browser versions were not recorded.

Use only the trial identities. Do not record passwords, TOTP secrets, recovery codes, OS PINs, session/browser cookies or private keys. Record screenshots only after hiding setup secrets.

## Environment to record

| Field | Tab S9 Ultra | MacBook Chrome | MacBook Safari |
|---|---|---|---|
| Hardware | Samsung Tab S9 Ultra | 16-inch M4 Pro MacBook | Same MacBook |
| OS version | Pending | Pending | Pending |
| Browser version | Pending | Pending | Pending |
| Screen lock enabled / unlock method | Guardian fingerprint enrolled; Adam knows PIN and reports successful passkey sign-in using it | 1Password used for guardian TOTP | Pending |
| Passkey manager/provider | Samsung reported initially; 1Password reported later; provider for final successful PIN route not confirmed | 1Password for TOTP; student passkey route not tested | Pending |
| Sync enabled / shared OS or account | Pending (no account addresses needed) | Pending | Pending |
| Normal/private profile | Normal required initially | Separate student profile recommended | Normal required initially |
| Local/platform vs cross-device QR/security key | Record actual route taken | Record actual route taken | Record actual route taken |

## Run in this order

For each test record **pass / fail / not run**, device/browser, time and a short observation. A cancelled prompt is not a server verification failure; distinguish them.

| ID | Action | Required result | Hardware result |
|---|---|---|---|
| H01 | Guardian password login, test TOTP enrollment and verification on MacBook Chrome | Password alone cannot approve; valid TOTP enables approval | Core flow passed (16 Oct): guardian password login, TOTP setup in 1Password and verification; password-only denial covered by automation, not separately reported on hardware. |
| H02 | Request enrollment on tablet; inspect and approve code on MacBook | Correct browser label and synthetic student; ten-minute expiry | Passed (16 Oct): tablet code reviewed and approved on MacBook Chrome; repeated during recovery. |
| H03 | Create student passkey on tablet | OS lock/biometric prompt succeeds; registration is allowed only after approval | Passed (16 Oct): registration and subsequent access succeeded; Samsung manager reported initially. |
| H04 | Sign in with passkey; check student access | Test Student only, no guardian controls authorized | Core flow passed (16 Oct): protected check returned Signed in as Test Student; guardian-route denial covered by automation. |
| H05 | Sign out, close all Chrome windows, reopen, then sign in | Browser approval survives; child completes sign-in without guardian | Passed across reported checks (16 Oct): approval survived sign-out/reopening Chrome; subsequent PIN sign-in confirms independent access. Final PIN provider unconfirmed. |
| H06 | Close/reopen while signed in | Valid student session resumes within limits; no elevation | Not run |
| H07 | Cancel passkey prompt, then retry normally | Cancellation gives a recoverable error; no new session from cancellation | Not run |
| H08 | Open a fresh browser/profile with a synced key, before approval | Sign-in denied despite availability of the key | Not run |
| H09 | Approve that new browser; select Sign in with passkey | Existing synced key can be associated after approval and verification | Not run |
| H10 | MacBook student enrollment/login in Chrome and Safari, guardian in a different browser | Record actual provider and prompts; do not assume browser passkey stores are interchangeable | Not run |
| H11 | Guardian revokes just the tablet browser while it is signed in | Next Check student access fails; another approved browser continues | Partial (16 Oct): active tablet browser revoked; protected check returned SIGN_IN_REQUIRED, login APPROVED_BROWSER_REQUIRED. Other-browser survival not physically tested. |
| H12 | Guardian revokes the credential used on multiple approved browsers | Every copy and associated session loses access | Partial (16 Oct): credential revoked; protected check returned SIGN_IN_REQUIRED, old-key attempt after reapproval returned passkey not found. Multiple physical copies not tested. |
| H13 | Clear site cookies in a disposable student profile | Existing passkey cannot bypass lost browser approval | Not run |
| H14 | Repeat enrollment on that profile; approve and use existing/new key | Access recovered for the same synthetic student; no weak PIN fallback | Recovery demonstrated (16 Oct) after browser revocation using existing key, and after credential revocation using new key. Cookie-clearing variant not run. |
| H15 | Leave an approved code unused for ten minutes; attempt registration | Expired approval denied; request a new enrollment | Expiry symptom observed (16 Oct): APPROVED_ENROLLMENT_REQUIRED after delayed approval; fresh enrollment recovered. Exact elapsed time not recorded. |
| H16 | Leave guardian without TOTP verification for over five minutes; try revoke/approve | Step-up required; valid TOTP restores ability | Not run |
| H17 | Leave student without protected requests for over 30 minutes | Student check locks; sign out, then independent passkey sign-in restores access | Not run |
| H18 | If already available, test a security key that supports user verification | Same approval policy and UV requirement; no purchase assumed | Not run / optional |
| H19 | Revoke all student access | Every student session/grant/key is denied; guardian still works | Not run |

Keep the page idle during H17; refreshing status counts as activity. For a cross-device QR flow, record the assisting device and whether the child could repeat it independently. A flow requiring the guardian's phone every morning does not meet the independent-access requirement even if WebAuthn technically succeeds.

## Decision rule

Do not mark the feasibility spike passed until the tablet can independently sign in on its approved normal Chrome profile and the guardian MacBook flow works, including physical-browser revocation/recovery checks. Chrome and Safari results must be recorded individually. A negative result should retain the full symptom and stage (prompt, registration, assertion, approval, session) without secrets. Revisit the auth choice if supported hooks or practical device UX cannot meet the requirements. Automated Chromium results cannot replace this evidence.

On 16 October the user explicitly accepted the spike and separately authorized the foundation milestone. Acceptance does not turn unrun physical checks into passes.

## Usability conclusion — 16 October 2026

The guardian rejected daily fingerprint assistance. After a sign-out/sign-in test was requested, they confirmed Adam can sign in using his PIN. This is local passkey unlock, not a new website PIN credential. No session policy was changed: the discussed 30-day remembered session was only a proposal and was not implemented. Existing 12-hour absolute / 30-minute idle limits remain. Earlier fingerprint-assisted successes alone did not demonstrate independent access. The final credential provider and whether the PIN is the OS or provider PIN remain unconfirmed; never record its value.

The user declined the additional Safari test on 16 October 2026. Do not repeat that request for the spike; keep it recorded as not run. The other unrun physical edge cases above remain evidence gaps. Do not mark multi-browser/synced-key checks passed from the single-tablet revocation/recovery results. Production integration and live-data readiness require separate validation.

**Acceptance — 16 October 2026:** the user stated “the auth spike succeeded as well” and authorized the foundation milestone. Core feasibility is accepted for proceeding; outstanding checks retain their recorded status. No session policy was changed.
