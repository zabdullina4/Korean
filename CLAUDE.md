# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow: TODO.md is the source of truth

- **Before starting any work, always read `TODO.md`** — it holds what is done, current problems and the detailed plan of next steps.
- **After finishing a task, update `TODO.md`:** tick it as done (`[x]`), and write down the important details the next step needs (decisions taken, what was deliberately left out, new known problems, numbers such as test count or bank sizes). Add new tasks you discovered to the plan. Commit `TODO.md` together with the work.

## Project

«한국어 학교» — a Korean-language school for Russian speakers (Hangul → TOPIK 6급), built as a React + TypeScript + Vite web app/PWA. All UI text, lesson explanations and commit-facing docs are in **Russian**; learning content is Korean. Design rationale and the full curriculum plan live in `docs/01–07` (methodology, school system, curriculum, modules, algorithms, UX, roadmap) — read them before adding a new grade or feature. `prototype/index.html` is the original static mock-up, not used by the app.

## Commands

```bash
npm run dev                 # Vite dev server
npm test                    # vitest run (all *.test.ts under src/)
npx vitest run src/lib/conjugate.test.ts   # single file
npx vitest run -t "해요체"                  # single test by name
npm run typecheck           # tsc -b (strict, noUnusedLocals/Parameters)
npm run build               # typecheck + vite build → dist/
npm run build:artifact      # build with in-memory router → dist-artifact/page.html + assets/
```

`build:artifact` exists because the app is published as a claude.ai artifact: that host rejects `#/path` hashes, so `VITE_ROUTER=memory` swaps `HashRouter` for `MemoryRouter` (see `src/app/App.tsx`), and the page file is emitted without its own `<head>`. Asset filenames are hashed, so republishing needs the new files mapped and the old ones removed.

## Architecture

**Content is data; forms are computed.** Lessons are plain `Lesson` objects (`src/content/types.ts`) in `src/content/gradeN/*.ts`, registered in `src/content/catalog.ts` (`LESSONS`, `GRADES` with units, `EXAMS` keyed by grade). A lesson is a list of `Step`s; `kind` selects the renderer in `src/features/lesson/LessonPlayer.tsx` + `steps/` (board, dialogue, letters, choice, build, compose, hanja, wongoji, write). Adding a step kind means: extend the `Step` union, add a component, add it to the player's switch and `STEP_LABEL`, and decide whether it is `autoReady`.

**New words are taught before they are tested.** `catalog.ts` maps every lesson through `withVocab()` (`src/content/vocab.ts`), which inserts a `words` step (flashcards: Korean → translation, pronunciation, audio) after the first letters step, or else after the first board/dialogue, and always before the first choice/build step that mentions a lesson word. Don't add vocabulary quizzes without listing the words in `lesson.words`; the content test `testedBeforeTaught` fails otherwise. A lesson may place its own `words` step, and then no step is injected.

**Conjugation engine** (`src/lib/conjugate.ts`) is the core: `haeyo()`, `conj(verb, form)` and `conjDistractors(verb, form)` for ~80 `Form`s across 0–4급, with irregular classes (ㅂ/ㄷ/ㅅ/ㅎ/르, ㄹ-stems, ㅡ-drop) handled via `stemForEu`, `withL`, `withN`, `neunda`, `eum`. Exercises are generated from it via `src/content/gen.ts` (`formItem`, `attrItem`, `counterItem`, `clockItem`, …) whose `FORM_RULE` record must have an entry for every `Form` (TypeScript enforces this). Numbers (`sino`, `native`, `nativeCounter`, `clock`) are in `src/lib/numbers.ts`.

**Distractor rule:** wrong options must be ungrammatical or clearly wrong given the Russian prompt. Several "distractors" have turned out to be valid Korean (e.g. 놀고 가요, 좋을 날, 추운 때, 사진을 찍으면 좋습니다) — when adding forms or exam items, dump the generated options and review them, and leave a comment when a candidate is deliberately excluded.

**Morphological analyzer** (`src/lib/morph.ts`, `src/lib/dictionary.ts`) works by *generate-and-match*: for every verb/adjective in the dictionary it runs the `T` templates (built on the same conjugation helpers) to build a reverse index surface→analysis. Nouns are split into particle/copula chains (`P` list, with consonant/vowel agreement warnings). Each morpheme can link to the lesson that teaches it via `lessonId`. When a lesson introduces a new ending, add a template there too, otherwise taps in lessons and the dictionary won't recognise it. The dictionary is `BASE_DICTIONARY` (`src/content/dictionary.ts`, pipe-separated rows) merged with all lesson words; lesson-word part of speech is guessed, so adjectives from lessons should also be added to the base list.

**Tap-to-analyse:** `components/Rich.tsx` renders the `[[class|text]]` mini-markup used in all content strings; inside a `WordTapProvider` (only in `LessonPlayer`) it turns Hangul words into buttons that open `WordSheet`. Exams and the notebook drill intentionally have no provider; choice prompts pass `tap={false}` until answered.

**Learner state** is one zustand store persisted to localStorage (`src/state/store.ts`, key `hakgyo-v1`, versioned `migrate`). Pure logic lives in `src/lib`: FSRS wrapper (`srs.ts`, ts-fsrs), error notebook 오답노트 (`notebook.ts`, closes after 3 correct answers on different days), daily timetable generator (`plan.ts`: 조회 → 1교시/2교시 lessons or the grade exam → 종례), exam grading/retake rules (`exam.ts`).

**Exams:** `ExamDef.make(seed)` produces a deterministic variant (`lib/random.ts`); `seedFor(examId, attemptNo)` makes retakes differ. TOPIK I exams use `topikExam()` in `src/content/exams/topik.ts` over banks of `Raw = [body, options, why]` with the **correct option first** (shuffled at build time). `topik3.ts` / `topik4.ts` (TOPIK II) build sections themselves and use weighted questions, a `write` question kind (auto-scored by `gradeWriting`: length, 한다체 style, keywords, plus paragraphs/connectives when `WriteItem.structure` is set for essay 54; non-length parts scale with `n / min`) and `perSection` scaling to 300; `minWriting` fails an attempt whose writing task is below that share even if the total passes. Failing records mistakes into the notebook; retake unlocks only after each mistake is drilled. Passing promotes `grade`.

**Writing tools:** `lib/wongoji.ts` lays text out on a 20-column 원고지 grid by TOPIK rules; `lib/writing.ts` flags non-한다체 endings and 저/제가.

**Campus** (`features/campus/CampusScene.tsx`) places grades into slots via `assignSlots(current)` so the current grade is always the large front-centre building; windows map to units.

## Content tests that guard data

`src/content/catalog.test.ts` and `src/lib/*exam*.test.ts` validate content rather than code: answer indices exist, options are unique, build-step targets are in the pool, compose targets are buildable from the palette, hanja characters align with syllables and the root's reading, writing models fit length/style, exam banks have no duplicate bodies and retakes overlap < 60%. Keep them passing when editing content; they are the main safety net for Korean correctness.

## Conventions

- Lesson ids: `g{grade}-u{unit}-l{n}`; word ids `w-<romanisation>` — reuse an existing id for the same word so cards are shared.
- Colours are CSS tokens in `src/styles/global.css` (light + dark blocks); skills use the 오방색 palette. Avoid literal colours.
- Lessons for a grade above the student's current grade open as previews (progress not saved).
