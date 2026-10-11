# General Science Olympiad tool ideas (backburner)

Source: no single event; these are cross-event or team-level tools. They are **not** event-specific, so keep the set to 1–3 and build them only after the event-specialized tools. They must not drift into the saturated question-bank niche (scio.ly, olyprep, "Grind") or generic flashcard apps (Quizlet, Anki); the differentiator is that the content is the student's own or is derived from the rules, not a scraped bank.

This set is intentionally parked; see `generalToolIdeas.js` for the code placeholder TODO.

## Tool: Generic Event Timer
- **Status:** Planned (backburner)
- **Category:** Practice
- **Goal:** Run the manual's timed phases for any event (WIDI writer 25 min / builder 20 min; Boomilever 6-minute testing window; EV 8-minute window; written-test pacing).
- **Core interaction loop:** 1) Pick a preset (event, phase, duration) or a custom duration. 2) Start/pause/reset; hear or see phase transitions. 3) Record the elapsed time (e.g., WIDI build-phase time as the tiebreaker).
- **Content & data:** Preset durations derived from each event's manual; no content.
- **UI components:** Preset list, countdown display, start/pause/reset, optional sound.
- **Scoring & feedback:** none (timer).
- **Level gating:** none.
- **Persistence:** none (or localStorage for a custom preset set).
- **Open questions:** none.

## Tool: Self-Quiz Flashcards
- **Status:** Planned (backburner)
- **Category:** Practice
- **Goal:** Author and drill the student's own prompts/answers for any event.
- **Core interaction loop:** 1) Author a card (prompt + answer) tagged by event/topic. 2) Drill in quiz mode (flip, self-grade, shuffle). 3) Re-drill missed cards.
- **Content & data:** User-authored prompts/answers only; no bundled deck. Content is the student's own, which is the differentiator from premade question banks.
- **UI components:** Card author form, event/topic decks, quiz mode, missed-card review.
- **Scoring & feedback:** Self-graded recall; practice only.
- **Level gating:** per-card tag.
- **Persistence:** localStorage; CSV import/export.
- **Open questions:** whether a general card tool is distinct enough from the event-native reference compiler to justify building both.

## Tool: Rules-Change Highlighter
- **Status:** Planned (backburner)
- **Category:** Notebook
- **Goal:** Show what changed in an event's rules from the prior season to the current one.
- **Core interaction loop:** 1) Pick an event. 2) Read a diff of the current manual's event section against the prior season, with changes highlighted. 3) Jump to the relevant citation.
- **Content & data:** Two seasons of manual text per event (the official manual already bolds year-over-year changes); rule-derived, no invented content.
- **UI components:** Event selector, side-by-side/annotated diff, citation links.
- **Scoring & feedback:** none (reference).
- **Level gating:** none.
- **Persistence:** none.
- **Open questions:** sourcing/storing prior-season manual text; whether this belongs in `memory_bank` as an annual maintenance task instead of a tool.
