# Nexai companion voice — research and editorial direction

19 October 2026. Research completed for the requested rewrite of all 240 short Dutch review messages. **Research and proposed direction; not editorial approval or evidence of learning benefit.**

The user wants a curious cartoon-cat companion with more personality, while retaining the existing message length and the separate Rekenen page awaiting review. This note supplies the rationale for the [message contract](../design/nexai-messages.md) and [character bible](../design/nexai-character-bible.md); those documents own the resulting rules. No artwork, animation, learning logic or production integration is authorized by this research.

## Local evidence and constraints

Read the development protocol, character bible, original character brief, message review contract, actual candidate source, verification guidance, tasks and MVP scope. The initial learner is eight, in groep 5; short familiar Dutch matters more than an assumed reading-age score. The existing catalogue contains 12 groups of 20 authored messages. Its measured pre-rewrite range is **2–13 whitespace-separated words and 14–62 characters**, with medians of **8 words and 40 characters**. These are local source measurements, not scientific thresholds.

Retain this compact envelope for the rewrite: at most 13 words and 62 characters per candidate, generally one or two short sentences. Do not expand a message into a paragraph to accommodate personality. Rephrase instead of appending a cat joke to every existing line. A third tiny beat can work only when the entire message remains equally brief and clear.

Existing constraints remain: predefined event-driven copy; taak/taken; no solution on a first miss; no explanation after a correct retry; actual worked explanation after the second miss; factual completion and perfect-score distinctions; no invented rewards. The approved static poses and localized motion do not automatically approve a new message/pose mapping. Angry examples remain separately reviewed attention/planning proposals, never reactions to mathematical mistakes. The current Rekenen review must remain available.

## What the sources establish

### Feline curiosity, play and quiet company

FelineVMA's own client education describes cats as curious and active, and distinguishes exploration/play, safe resting places and predictable social interaction. It emphasizes individual preferences rather than one universal cat temperament. This gives an observational basis for a character who notices, investigates, settles nearby and occasionally plays; it does not prescribe educational dialogue. [FelineVMA, September 2025: What Your Cat Needs to Feel Secure](https://catvets.com/resource/client-education-cat-friendly-practices/).

Humphrey and colleagues experimentally studied slow blinking in cat–human communication. Cats showed more eye narrowing in response to human slow blinks; in a second experiment they were more likely to approach an experimenter's hand after slow blinking than after the control expression. This supports using restrained affiliative behavior as a feline reference, with limits: it is research about real cats, not children's interpretation of an illustrated character, and not an instruction to add new motion. [Humphrey et al., 2020, Scientific Reports](https://www.nature.com/articles/s41598-020-73426-0).

**Creative inference for Nexai:** curiosity can be a small question or noticing phrase; companionship can be sitting alongside the task. Playfulness belongs to his own paws, ears, whiskers, tail and tiny cat preoccupations. A quiet companion remains recognizable without making every message a pun or noise. Cartoon exaggeration is an editorial choice, not an animal-science finding.

### Feedback without judging the child

Mueller and Dweck's six experiments with fifth graders compared praise for intelligence and effort. Intelligence praise produced less favorable responses after failure on several measured outcomes, including persistence, enjoyment and performance, relative to effort praise. These are specific experimental conditions with older children, not a universal effect size for every praise phrase. [Mueller & Dweck, 1998, original paper hosted by Columbia University](https://www.columbia.edu/cu/psychology/courses/3615/Readings/Mueller_Dweck.pdf).

**Editorial inference:** confirm the observable answer or completion rather than label Adam's intelligence. The study does not justify inventing effort: a submitted number cannot establish that he concentrated, tried hard, chose a clever strategy or improved. Prefer “Dat antwoord klopt” to “Wat ben jij slim” or “Je hebt hard gewerkt.” A factual warm acknowledgement is enough; correctness need not earn the companion's affection.

### Structure without pressure

Reeve and Jang studied 72 pairs of preservice teachers assigned teacher/student roles in a laboratory learning activity. Behaviors including listening, allowing a learner to work in their own way and informational feedback were associated with perceived autonomy. The paper distinguishes informational feedback from controlling approval. Because the participants were preservice teachers in role-based interactions, this is indirect evidence for a Dutch child's app. [Reeve & Jang, 2006, original paper](https://selfdeterminationtheory.org/SDT/documents/2006_ReeveJang_JEP.pdf).

**Editorial inference:** give an understandable next action, allow thinking time, and offer only choices the interface really supports. Firm reminders can identify an open task and a next step without threats or assigning motives. Avoid “Ik wacht al zo lang”, “Doe het voor mij”, surveillance claims, or promises that the app cannot honor. A planning reminder must not pretend to know why work remains open.

### Clear short language

W3C recommends familiar words, simple sentences and removing redundant wording; its cognitive accessibility guidance also warns against invented terms. [W3C G153](https://www.w3.org/WAI/WCAG21/Techniques/general/G153.html), [W3C: Use Clear Words](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o3p01-clear-words/).

W3C's literal-language pattern cautions that jokes and metaphors can obscure meaning and prioritizes literal headings, instructions and error messages. It is supplemental guidance, not a claim that every joke fails WCAG. [W3C: Use Literal Language](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o3p04-literal-language/).

**Editorial inference:** the result and next action must be understandable without decoding a cat metaphor. Use plain “goed”, “antwoord”, “som”, “taak”, “uitleg” and “Ammar” where required. Keep optional charm separate from instructional meaning. Avoid cat-word substitutions such as invented labels for correctness or tasks, sarcasm, exaggerated baby talk, and stage directions in a speech bubble. The 13-word/62-character cap is a project choice, not a W3C recommendation.

## Proposed voice rules for the rewrite

Nexai is a curious little companion who settles beside Adam, notices what is in front of them and enjoys small discoveries. His humor is about himself. He can be warm, quietly pleased and mildly mischievous; he does not become a judge, tutor with unverified explanations, needy pet or authority over rewards.

1. **Keep the event legible.** Every candidate must suit its category without relying on its pose to explain the result. A light character beat must not replace correctness, completion or the required next step.
2. **Use one small personality beat.** A curious question, a short observation, nearby company or a cat detail is sufficient. Vary rhythm and point of view; repeating “miauw” across 240 messages is not a personality.
3. **Keep setbacks calm.** After an incorrect answer use warmth and quiet presence, not jokes, mock surprise, angry language or theatrical disappointment. First misses give no hint or answer. Do not imply an immediate retry when the question returns later.
4. **Make success proportionate.** A correct answer gets brief confirmation. Whole-task celebration can be more playful. A perfect-task claim is confined to the all-first-attempts-correct category.
5. **Stay alongside the learner.** Use bounded task company such as sitting or looking alongside. No exclusive bond, guilt for leaving, claimed emotional insight, or suggestion that Nexai has been monitoring the child outside explicit app events.
6. **Keep reminders factual.** The two firm categories may direct attention or name still-open planned work, without declaring inattention, laziness, a broken promise or an excuse. Their detection and use remain separate product decisions.
7. **Protect brevity and natural Dutch.** Read each candidate aloud. Stay within the existing envelope and avoid stacked exclamation marks, long explanation, unfamiliar idioms and grammar distorted to achieve uniqueness.

These rules reconcile the new request with existing guidance: more curious companionship applies throughout; the earlier welcome/celebration-only humor boundary remains. No conflict requires adding jokes after mistakes or revising approved motion.

## Illustrative contrasts

Examples show the direction, not approved final catalogue selections.

| Situation         | Proposed compact direction                    | Avoid                                      |
| ----------------- | --------------------------------------------- | ------------------------------------------ |
| Welcome           | Pootjes klaar. Welke taak kies jij?           | A long welcome story before choosing       |
| Ready             | Ik kijk mee. Neem je tijd voor de som.        | A hint disguised as curious cat behavior   |
| Correct           | Ja, dat antwoord klopt!                       | Wat ben jij slim!                          |
| First miss        | Nog niet goed. Ik blijf naast je zitten.      | A pounce joke about a wrong answer         |
| Explanation       | We kijken samen naar de uitleg hieronder.     | An invented reason the child got it wrong  |
| Complete          | Taak klaar! Tijd om mijn poten te strekken.   | A claim that all answers were correct      |
| Guardian review   | Taak klaar. Zullen we Ammar erbij vragen?     | A claim that approval has already happened |
| Open planned work | Dit oefenblok staat nog open. Kijk met Ammar. | Je hebt me weer laten wachten.             |

The examples remain speech, not promises of new synchronized gestures. “Hieronder” is only valid where the explanation actually appears below the bubble.

## Review and limits

Review all 240 candidates for shortness, natural Dutch, event accuracy and consistent character; test length/identity constraints separately from editorial judgment. Keep the new wording under a new catalogue version so existing ratings do not silently attach to rewritten text. Preserve the earlier review data and the separate Rekenen story. Unit checks and browser rendering establish structure and display behavior, never user approval.

No cited source tests Nexai, these Dutch phrases, 240-message variety or learning outcomes for Adam. Animal behavior inspires character details; it cannot validate an educational intervention. The educational experiments and accessibility guidance inform conservative choices, with population/context differences stated above. The remaining question is whether Adam finds the language clear, companionable and enjoyable in the actual short-bubble context. That requires human review and later observation, not a claim that research has already proved it.

Sources accessed 19 October 2026. This research note itself changes no runtime behavior.
