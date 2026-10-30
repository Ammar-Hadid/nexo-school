# Nexai character bible

**Master v1 · Approved by the user · 18 October 2026.** Approval: “okay approved, save this Nexai as our master in the design system and create the character bible and reference sheet so we can keep him consistent in every future pose”.

This records the accepted layered character and greeting; it does not approve unmade poses, product screens or a production component. The visual reference sheet documents existing pixels, not newly generated artwork.

## Definitive gender and pronouns — 26 October 2026

**Nexai is a boy (male cat).** English pronouns: **he/him/his**. Dutch pronouns: **hij/hem/zijn**.

The user explicitly delegated this choice to the assistant and instructed that it be definitive and saved in the shared systems. The assistant chose boy, making the existing masculine references explicit. This is the canonical character-identity decision for future documentation, copy and creative work; it is settled, not a proposal awaiting review.

His curious, warm, quietly playful personality remains the character direction. Preserve the approved master, poses, motion and exact message catalogue.

## Source of truth

1. [Master manifest](references/nexai/master-v1/manifest.json): exact approved source files, roles and SHA-256 fingerprints.
2. [Reference sheet](references/nexai/master-v1/reference-sheet.svg) and [standalone assembled master](references/nexai/master-v1/nexai-master.svg): derived directly from those sources, with embedded raster artwork for portable viewing. The SVG is a layer container, not vector-traced fur.
3. [Original layered artwork and greeting](references/nexai/layered-v1/README.md): canonical PNG sources and editable registration/timeline code. Keep these paths stable; do not duplicate competing editable masters.
4. [Option 2 concept](references/nexai/nexai-soft-3d-concept-v1.png): historical inspiration. Where its proportions, pose or coloring differ from the accepted layered character, **master v1 wins**. The rejected Blender reconstruction is not a reference and was deleted.

Open the [reference page](http://127.0.0.1:6010/master-v1/reference.html). Rebuild derived sheets with `python3 scripts/art/nexai/build_reference_sheet.py`; verify the frozen source/export hashes with `python3 scripts/art/nexai/verify_master.py`. Do not update hashes merely to silence a mismatch.

## Identity: what must stay recognizable

| Feature     | Fixed identity                                                                                                   | Allowed variation                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Silhouette  | Compact seated cat, broad tufted cheeks, tall triangular ears, large curled tail                                 | A reviewed pose may stand, lean or turn; preserve age and build                                |
| Face        | Broad cream muzzle, little pink triangular nose, small friendly mouth, distinct dark brows                       | Eyelids, gaze, brows and mouth may express a situation; do not change the underlying face      |
| Eyes        | Large dark purple-black eyes, cream-white surrounds and bright highlights; expressive without becoming baby-like | Closed lids or changed gaze; preserve spacing and socket shape                                 |
| Ears        | Purple outer ears, cornflower interiors, rounded edges and small tufts                                           | Gentle tilt; retain size relative to head                                                      |
| Coat        | Soft shaded purple, fine restrained fur texture, cream cheek/chest/paw areas                                     | Lighting consistent with the master; no glossy plastic, flat vector fill or realistic long fur |
| Tail        | Thick, curled, cornflower tip with an irregular purple-to-blue boundary                                          | Sway/pose adjustment; no thin straight tail or different tip marking                           |
| Paws        | Rounded cream toes; subtle pink pads visible on the lifted paw                                                   | Pose changes without human fingers, extra limbs or mitten-like redesign                        |
| Accessories | None                                                                                                             | Any costume, accessory or new marking needs a separate character-direction decision            |

Preserve the master’s gentle light from above/front-left, soft shading and stable highlights. Do not recolor Nexai red after a mistake or green after success. UI status colors carry those meanings; the character keeps his identity.

Purple `#8759A6` and cornflower `#93B4F4` are brand anchors from the existing palette, not flat replacement colors for shaded pixels. Cream/pink/eye colors and texture are baked illustration details, not new UI tokens. Changing application tokens does **not** automatically recolor the raster artwork. Recoloring requires a new reviewed asset revision.

## Proportions and registration

The authoritative unit is the original **1536 × 1024 atlas**. The composed SVG viewport is `40 0 1030 1024`. Preserve uniform scaling; never independently stretch width or height. These are registration coordinates for this pose, not a specification for unseen anatomy.

- Body layer: atlas clipped to x=0–1040. The separated arm occupies the right side of the atlas; it must never appear as a second floating arm.
- Arm: atlas clip x=1050, y=260, width=420, height=490. Source shoulder pivot `(1320,650)` attaches at `(400,550)` in the composition. Arm paints **behind** the body.
- Eye sockets are approximately centered at `(456,311)` and `(680,342)` in atlas coordinates. Use the actual artwork, not these rounded measurements, to judge facial identity.
- Closed-eye overlay: the accepted mask/clip in `nexai-master.svg` and the original review composition is authoritative. It excludes the eyebrows. Replacing the entire head with a generated blink frame can introduce expression drift.
- Read the reference-sheet detail crops at equal scale when comparing eye spacing, muzzle width, ear tips, fur markings and tail curl. Existing asymmetric perspective is intentional; do not “correct” it into a perfectly symmetrical face.
- No side/back turnaround is approved. Do not infer that a generated unseen angle is canonical until reviewed.

## Personality and language

Nexai is a curious, warm cartoon-cat companion: observant, quietly playful and a little cheeky. He settles beside Adam and takes an interest in the task. He belongs in the student portal; the guardian portal stays mascot-free. He is not a judge, reward authority or live AI chat agent.

**19 October 2026 voice amendment:** the user requested more companion personality and research before rewriting all 240 messages at their existing length. This expands the earlier “occasionally cheeky” direction into the behavior below. The user subsequently approved all 240 catalogue 2 messages and authorized their use in the current Rekenen review. The behavior direction now guides that approved wording; the complete page and future revisions remain separately reviewable. [Research and limits](../research/2026-10-19-nexai-companion-voice.md); [canonical writing rules and catalogue 2](nexai-messages.md#voice-and-writing-rules--catalogue-2).

| Trait         | How Nexai expresses it                                                        | Boundary                                                                                                |
| ------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Curious       | Notices a task, peeks, wonders what comes next, invites a closer look         | Questions must not leak an answer or invent a chat interaction                                          |
| Companionable | Settles nearby, makes room, looks alongside, waits without hurry              | Company does not depend on success; no guilt, exclusivity or claimed insight into feelings              |
| Catlike       | Small references to his paws, ears, whiskers, curled tail or comfortable spot | One light detail is enough; no compulsory “miauw”, baby talk or cat-word substitutions for instructions |
| Playful       | Gentle self-directed humor about boxes, stretching or his own cat habits      | Jokes remain for welcome/completion/celebration; mistakes get quiet support                             |
| Attentive     | Brief factual confirmation, calm next step, interest in an explanation        | No claims about intelligence, unseen effort, mastery, laziness or promised rewards                      |

Use short natural Dutch with **taak/taken**. The accepted master greeting remains “Hoi Adam! Welke taak kies je?” in a selectable HTML bubble. Catalogue 2 contains 240 approved authored messages; future rewrites require review. [The message contract](nexai-messages.md) owns their length, event constraints and review rules; [Approved Rekenen revision 4.1](rekenen-task.md#approved-pattern-and-reuse) adopts those messages with approved exercise-state assignments and variation.

Spoken cat imagery is characterization, not a promise of synchronized movement. Use the existing approved pose/motion library; this voice change adds no stretching, tail movement, jumping, sound or new artwork.

## Motion and placement

Approved greeting: 2.6 seconds, two brief blinks, a waving forepaw and subtle whole-body tilt. Reuse the accepted timing source rather than recreating it on each page. The greeting does not change the planned 600–900 ms per-answer reactions.

- **18 October amendment:** the user now wants a living companion with varied ambient movements. This supersedes the earlier no-idle-motion restriction. Alternate short actions and rests, preserve pause/reduced-motion controls and stop work while hidden or offscreen. No sound. Meaningful answer reactions still play once per answer event.
- Reuse the same layers for timing/expression variants whenever possible. New artwork is needed only when existing parts cannot express the pose convincingly.
- Cancel prior motion when replaying, advancing, stopping or hiding the page. Rendering again is not a new answer event.
- Reduced motion gives a static pose with the same message. Do not block an answer or navigation while motion plays.
- **Full-body rule (explicit user instruction, 18 October):** show Nexai’s complete body, ears, paws and tail, with room for every animation. Cropping is allowed only when he intentionally hides behind a visible object in the scene. A cut-off viewport or card edge by itself is not hiding. Detail crops in the character reference sheet are documentation only.
- One Nexai in a composition, placed in layout; never cover passages, inputs or buttons. Keep visible margins around ears, tail and raised paw throughout movement.
- Small previews on the sheet are identity checks, not approval of a universal minimum size. Validate each actual placement; show fewer details rather than shrinking unreadable text.
- Future product artwork is decorative for screen readers. Announce meaningful feedback once through HTML; maintain keyboard focus. Missing artwork must leave readable feedback and usable actions.

## Asset inventory and status

| Asset / behavior                                                                                          | Status                                                     |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Layered welcome character, open eyes, raised paw                                                          | Approved master v1                                         |
| Localized blink overlay and 2.6-second greeting                                                           | Approved in the reviewed asset proof                       |
| Reference-sheet crops, closed-eye and size previews                                                       | Documentation derived from master v1; not additional poses |
| Neutral resting-arm pose, thinking, pleased, encouraging, explaining, celebrating, waiting-together poses | New cel candidates produced; In Review, not approved       |
| Full expression/message catalogue                                                                         | Catalogue 2 messages Approved separately, 19 October 2026  |
| Shared `NexaiCompanion` and synthetic exercise reactions                                                  | Implemented; motion review v2 In Review                    |
| Production exercise events                                                                                | Not implemented                                            |
| Physical Tab S9 Ultra animation readiness                                                                 | Not verified                                               |

The frozen source is raster layers, not a complete skeletal puppet: the head, ears and tail are not independently extracted. New independent motion may need additional carefully prepared layers.

## Workflow for every future pose

1. Read this bible and open the approved sheet and actual master. State which situation needs a pose and why existing layers are insufficient.
2. Prefer recomposing/moving approved parts. For generated edits, supply the **approved atlas/master**, not only the original option 2 or a previous unapproved derivative. Include the sheet for identity context.
3. Describe only the intended change. Lock face proportions, ears, tail markings, coat texture, lighting and color. Request transparent output and no text. A prompt is guidance, not a guarantee.
4. Save the candidate under a new versioned path. Keep its exact prompt, reference filenames/hashes and tool provenance. Never overwrite `layered-v1` or master v1 to install a candidate.
5. Compare beside master v1 at equal size: silhouette, face/eye spacing, nose/muzzle, ears, fur tufts, paws and markings. Inspect edges on light and dark backgrounds, layer joins, whole animation, small-size readability and reduced motion. Check clipping and ghosted features.
6. Present the candidate and motion for user review. Record **Draft → In Review → Approved** with exact revision/hashes and any intentional identity change. Automated hashes detect accidental file changes, not visual consistency or approval.
7. Add only the approved revision to the asset inventory. Keep master v1 for comparison. Update the shared presentation component when it exists; screens choose semantic situations rather than importing arbitrary images.

Suggested edit prompt starter:

> Use the attached approved Nexai master v1 as the identity source. Change only [pose/expression]. Preserve head and muzzle proportions, eye spacing, ear shapes, cheek tufts, purple/cream/cornflower markings, curled thick tail, pink nose/paw pads, fine soft fur and gentle studio lighting. No new accessories, text, background or redesign. Keep unaffected layers registered where feasible. Output transparent artwork; do not invent a new identity. [Specify asset bounds/layer needs.]

## Versioning and checks

Master v1's source PNGs and timing/composition evidence are frozen by the manifest. Source metadata records the approval, not a promise that all runtime accessibility/device tests passed. Future asset versions get new manifests and explicit approvals. Never silently replace the master because a generator produced a visually attractive alternative.

This documentation milestone does not add dependencies, 3D assets, application behavior or a production deployment. Verification evidence for this milestone is recorded in the master folder README.

## First page placement — 18 October 2026

The task overview now uses a static upper-body crop of master v1 in a feature-local greeting with HTML bubble. This page placement has Storybook coverage and is **In Review**, separately from the approved character. It is not a new pose or the general NexaiCompanion. The public atlas is an exact distribution copy; the canonical master and timing are unchanged. See [task-page revision 4](practice-blocks.md#task-page-revision-4--nexai-header-18-october-2026).

## Motion review v1 — 18 October 2026

Shared full-body `NexaiCompanion` now uses the master layers and exact approved greeting shoulder timing in Storybook. Twelve clips, ambient sequencing, pause/reduced-motion and a new masked yawn-mouth edit are **In Review**, not part of master v1 approval. Only the generated mouth region is painted over the original; no master pixels/files were replaced. See [motion contract](nexai-motion.md). Existing task-page and Rekenen placements now use the full-body component; this supersedes the earlier cropped placement.

## Motion revision 2 — paws-down rest and new poses

The user rejected the twelve whole-image movement trials and requested genuine articulated actions, including lying on his back, using image generation. Revision2 uses transparent cel drawings with distinct limbs, faces and body poses. **Resting paws must be down; a permanently raised greeting paw is not a neutral pose.** New standing/lying/back poses and animation are In Review; they do not silently replace the frozen approved master. See the current [motion contract](nexai-motion.md), [research](references/nexai/motion-v2/research.md) and exact prompt/asset manifest. Frame-by-frame consistency must be reviewed, not inferred from prompt wording or automated tests.

## Motion revision 3 — intermediate drawings

The user authorized image-generated in-between poses to improve continuity. Every generation used the approved atlas and the corresponding existing action sheet. New drawings are supplemental sources under `public/nexai/motion-v3/`; none replaces master v1. 81 selected drawings were wired into all twelve actions, then removed from active playback after user rejection. Prompted frame numbering is not reliable evidence: preserve the separately reviewed selection map and exclude wrong-paw or wrong-direction candidates. See [workflow and evidence](references/nexai/motion-v3/README.md). This motion revision is **Rejected**: separately generated drawings did not preserve temporal consistency. The restored v2.1 fallback remains In Review.

## Continuity correction — 18 October 2026

The master remains frozen. Do not treat independently generated pose sheets as reliable animation in-betweens. For future production, prepare stable editable layers, hidden-area artwork, joints/mesh deformation and authored timing. Large changes of view need deliberately authored additional artwork; the current front-view body and detached arm cannot supply a full-body rig. [Research and limits](../research/2026-10-18-nexai-animation-method.md). No full rig or smooth twelve-action replacement has been implemented or approved.

## Subtle master-motion review — 18 October 2026

The user selected a simpler interim scope: approved artwork with reliable subtle movement, reviewed separately before app integration. [Subtle review 1](references/nexai/subtle-v1/README.md) uses the existing eyelid overlay and arm, plus a maximum 0.3% **uniform** scale about the feet for a restrained breathing impression. This is an In Review presentation effect, not independent body-part rigging or a new canonical pose. It does not relax the prohibition on changing body proportions. Raised-paw rest remains the approved master pose. Original source pixels and frozen files remain unchanged; application adoption awaits review.

## Resting-pose correction — 19 October 2026

The user does not accept a permanently raised arm as the everyday pose. Wave should be a greeting, not the default posture. [Pose review 1](references/nexai/poses-v1/README.md) proposes a paws-down seated default plus thinking and belly-down alternatives, generated from the approved atlas and saved separately. These are **In Review** static artwork. The approved master remains the identity reference; no new pose or transitional animation is automatically approved. This request supersedes retaining the raised-paw resting posture in the interim subtle-motion proposal.

## Expanded emotion collection — 19 October 2026

The user liked the first three static poses and requested roughly 24 poses with three variations per mood, explicitly including sadness and anger. [Collection 2](references/nexai/poses-v2/README.md) contains 24 static poses: the three existing calm poses plus 21 new happy, proud, celebrating, curious, encouraging, sad and angry illustrations. Stable IDs, dimensions and hashes are in its catalogue. Every new generation referenced the frozen atlas and the paws-down rest candidate; the master is unchanged.

The expanded collection is **In Review**. Positive feedback on the earlier style is not approval of every new drawing or its placement. Emotional artwork and educational event mapping are separate decisions: sadness/anger are review candidates, not an instruction to scold Adam after wrong answers. Encouraging expressions are proposed for mistakes. No event mapping, animation or app integration was changed by this asset milestone. Preserve the warning against using independent illustrations as fluid in-betweens.

## Pose collection approval — 19 October 2026

The user explicitly approved all 24 static poses in [collection 2](references/nexai/poses-v2/README.md). The [catalogue](references/nexai/poses-v2/catalogue.json) is the canonical reusable pose register: stable IDs, paths and exact approved image hashes. This includes the three collection-1 poses and supersedes their previous In Review status. Reuse these assets for future compositions instead of regenerating approved poses. Master v1 remains the character identity authority. New illustrations or material changes need separate review. Animation and educational event mappings remain separate decisions.

## Small motion for the approved poses — 19 October 2026

The initial implementation misinterpreted the request for small movements as permission for whole-image transforms. The user explicitly rejected [pose motion review 1](references/nexai/pose-motion-v1/README.md); it is superseded by the localized review below. All 24 static artworks remain Approved. App integration and educational event mappings are unchanged. The supplied AGENTS statement that the shared component is not implemented is historical: `src/components/nexai/` already exists, as documented above; this milestone does not replace it.

## Localized pose motion 1 — 19 October 2026

The user rejected `pose-motion-v1`: moving an entire PNG is not an acceptable substitute for a visible blink or limb gesture. Its motion status is Rejected / superseded; static collection-2 approval remains intact.

[Localized review 1](references/nexai/layered-poses-v1/README.md) prepares one matching eye-edit source for each of the 24 exact approved poses. Only two feathered eye patches are displayed over the original. Left/right control supports winks; the three originally closed-eye poses briefly peek. Pose 17 includes a separately clipped paw, with the fixed forearm overlapping the moving layer. No whole-body translation or scaling.

The user explicitly approved these patches and timing on 19 October 2026 and requested shared-library adoption. They remain a separate approved revision, never part of frozen master v1. Preserve `sources.json`, per-pose masks and source hashes, and the revision manifest. Other limbs/ears/tails are not rigged. Use the [shared library](nexai-library.md); choose new situation mappings separately as their screens are designed.

## Situation proposal amendment — 19 October 2026

The user now explicitly wants angry Nexai for suspected lack of attention to practice and missed scheduled blocks. This amends the earlier recommendation to leave all angry poses unassigned. `angry-1` and `angry-2` are proposed in separate synthetic review examples with firm, action-oriented Dutch copy; neither is triggered by wrong answers, a low score or an inferred attendance event. The actual detection evidence, missed-work exceptions, guardian decision and final copy are not implemented/approved by this design request. Avoid presenting an uncertain motive as fact. Sad poses remain unassigned at the user's direction. See [Rekenen revision 3](rekenen-task.md#revision-3--approved-pose-assignments-19-october-2026).

## Message catalogue — 19 October 2026

The user requested 200–300 message variations, then a research-led rewrite with curious cartoon-cat companionship. All 240 catalogue 2 messages are now explicitly **Approved** and adopted in the synthetic Rekenen revision 4. The [catalogue contract](nexai-messages.md) records the approval, exact content fingerprint and permitted contextual use. Local workbench ratings remain optional editorial feedback, not publication or the source of approval. Preserve approved text/IDs/version; future material changes require a new review. The complete page and automatic behavior detection are not approved by the message decision.
