# Crime Scene Detective 🕵️🐱

**The Missing Ring at Sunflower Hotel**: a real-time classroom game for practising **simple past passive sentences** (*was / were + V3*) at A1-A2 level.

The teacher shows **/host** on the projector. Students scan a QR code and play on their phones at **/play**. Chó, a sleepy orange cat detective, needs the class to solve the case.

- Phase 1: every student writes one passive sentence for their picture at the same time, with a countdown.
- Phase 2: the 15 scenes are revealed one by one. Each sentence gets a **CLUE FOUND** or **CASE CLOSED: UNRESOLVED** stamp. A failed clue gets a second chance ("Beg for a second chance 🥺😭") or is accepted ("Accept our fate 🪦"), and it becomes CLASSIFIED.
- Chó's Lie Detector Test: a quiz that brings lost clues back (pass mark 60%).
- The vote: who stole the ring? More than 50% of votes for the real cheater = **WIN** (court, apology, punishments, peace, epilogue). Otherwise **LOSE**.

Static site (Vite, vanilla JS) + Firebase Realtime Database with anonymous sign-in. No server code.

---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and pick:

| Page | What it is |
|---|---|
| `/host/` | Big screen (teacher) |
| `/play/` | Student phone |
| `/host/?demo=1` | **Demo**: 15 fake students play in the same browser. Add `&outcome=lose`, `&fast=1` or `&mistakes=0.5` |

Without a Firebase config the game runs in **local mode**: the big screen and phones only talk to each other inside **one browser** (tabs). That is fine for the demo, but real phones need Firebase.

## Firebase setup (10 minutes, free plan is enough)

1. Go to https://console.firebase.google.com → **Add project**. Analytics are not needed.
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable.**
3. **Build → Realtime Database → Create database.** Pick a location near you (for Vietnam: `asia-southeast1`). Start in **locked mode**.
4. In **Realtime Database → Rules**, paste the content of [`database.rules.json`](database.rules.json) and press **Publish**.
5. **Project settings (⚙️) → Your apps → Web (`</>`)** → register an app (no hosting needed). Copy the `firebaseConfig` object.
6. Paste it into [`src/firebase-config.js`](src/firebase-config.js):

   ```js
   export const FIREBASE_CONFIG = {
     apiKey: '...',
     authDomain: 'your-project.firebaseapp.com',
     databaseURL: 'https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app',
     projectId: 'your-project',
     appId: '...',
   };
   ```

   The `databaseURL` line is required. If it is missing, copy it from the top of the Realtime Database page.
7. **Authentication → Settings → Authorized domains**: add your GitHub Pages domain (e.g. `yourname.github.io`).

The web config is not a secret: it is safe in a public repository. The **rules** protect the data.

### What the rules allow

- Only the room's host (the teacher's browser) can write `public` (game state, verdicts shown on the screen) and `hostData` (verdicts, settings).
- A student can write only **their own** player record, can take a seat **only in the lobby**, and can write a sentence only for **scenes assigned to them** while the state is `writing` (or during a student second chance for that scene).
- Students write only their own quiz answers (state `quiz`) and their own vote (state `voting`).
- Sentences, answers and votes can be read only by the host and their owner. Students never see each other's answers.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository (branch `main`).
2. Repository **Settings → Pages → Source: GitHub Actions.**
3. Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): unit tests → art → **level lint** → build → deploy.

The site uses relative paths, so it works under `https://yourname.github.io/repo-name/`.

## Lesson cheat sheet (teacher keys on the big screen)

| Key | Action |
|---|---|
| `Space` | Pause / skip the wait / next |
| `G` | **Gotcha**: stamp the current clue UNRESOLVED (the checker missed a mistake) |
| `X` | **Xin lỗi**: accept a sentence the checker rejected by mistake |
| `H` | Next hint (and a button sends it to the student's phone) |
| `R` | Reassign a scene to another student, or the teacher types it |
| `T` | Show / hide the checker's reasons (teacher only, small) |
| `B` / `V` | Case Board / Vocab Vault |
| `M` | Sound on / off |
| `E` | ⚙️ Story editor (lobby only) |
| `?` | Help |

Suggested flow (45 min): lobby and joining 5' → writing 3-5' → reveal 15-20' → quiz 5' → vote and ending 5' → recap.

## ⚙️ Edit the story (no code)

In the lobby, press **⚙️** in the top bar (or `E`). For each of the 15 scenes you can change the title, time, picture (built-in, a link, or **upload a photo**), scene type, prompt, story text, hints, model answers, the **keywords and verbs the checker accepts**, Chó's reaction and the bridge line. You can also rename the case.

- **Test a student sentence** shows exactly what the checker will say with your changes.
- **Level check** flags words outside the A1-A2 list, long sentences, and passive voice in the narrator text (students should make the passive, not read it).
- **Save** stores the story on this computer. Phones get it when they join the room.
- **Export file / Import file** shares a story with another teacher. **Reset** brings back the original.

Edits are allowed only in the lobby, so a running game never changes under the students.

## Edit the story in code

- Scenes: [`src/data/scenes.js`](src/data/scenes.js) (prompt, intro, reaction, keywords, accepted verbs, hints, model answers, glossary).
- Phrases (IPA, Vietnamese, patterns): [`src/data/vocab.js`](src/data/vocab.js). Pattern syntax: `{verb}` = any form of the verb, `a|an` = either word, `*2` = up to 2 free words.
- Endings, jokes and Chó lines: [`src/data/story.js`](src/data/story.js). Quiz: [`src/data/quiz.js`](src/data/quiz.js).
- Pictures are drawn in code: [`src/art/chars.js`](src/art/chars.js) (characters, with CSS idle animations) and [`scripts/build-art.js`](scripts/build-art.js) (scenes). Run `npm run art` after a change.

Before each build, `npm run lint:level` checks every player-facing text against [`scripts/a1a2-words.txt`](scripts/a1a2-words.txt). Add a glossary chip or simplify the sentence if it fails.

## Continuity: what the class knows after each scene

| # | Scene | Type | Model answer | The class now knows |
|---|---|---|---|---|
| 1 | Welcome to Sunflower Hotel | clue | A big banner was hung on the wall. | Panda and Penguin have a party. Chó is on holiday. |
| 2 | The Ring | clue | A ring was given to Panda by Penguin. | Penguin gives Panda a ring. |
| 3 | The Giant Cake | clue | A giant cake was made by Monkey. | Monkey makes the cake. Flamingo sings at the party. |
| 4 | Wake Up, Chó! | phrase: ask for advice | Chó was asked for advice by Panda. | Panda wakes Chó up. Chó takes the case. |
| 5 | The Empty Box | clue | The ring was stolen from the box. | The ring is gone. The window is open. |
| 6 | Banana Peel! | clue | A banana peel was found on the floor. | A banana peel is near the box. |
| 7 | Monkey in Trouble | clue | Monkey was blamed by everybody. | Everybody thinks it is Monkey. |
| 8 | The Secret Video | clue | A surprise video was made by Monkey. | Monkey was singing in a video at midnight. A small black and white shadow walks past. |
| 9 | Wet Footprints | clue | Wet footprints were left on the floor. | Small flat footprints go to the pool. No toes: not Monkey. |
| 10 | A Pink Feather | clue | A pink feather was found in Penguin's jacket. | Penguin is a suspect now. |
| 11 | The Photo | clue | A photo was taken by Giraffe. | Giraffe's photo: Penguin and Flamingo dance at midnight. |
| 12 | A Letter in the Pool | clue | A love letter was dropped in the pool. | A letter: "My pink star, see you at midnight. Love, P." |
| 13 | Hands Up, Penguin! | phrase: casual acquaintance | Flamingo was called a casual acquaintance by Penguin. | Penguin sweats and says Flamingo is only an acquaintance. |
| 14 | Flowers for No Reason | phrase: lie to / let down | Panda was lied to by Penguin. | Penguin says he slept all night. His beak grows: a lie. |
| 15 | The Ring on the Stage | clue | The ring was worn by Flamingo. | Flamingo wears Panda's ring. Time to vote. |

Scenes 1-8 never name Penguin as the thief (the checker rejects that spoiler), so the vote stays exciting.

## Tests

```bash
npm test            # checker (passive, agreement, spelling, phrases), data and story-editor tests
npm run lint:level  # A1-A2 word list, short sentences, no passive in narrator text
npm run build       # art + lint + production build in dist/
npm run e2e         # Playwright: phones (iPhone SE, Pixel 5, landscape) + full demo WIN and LOSE runs (needs Node 20+)
```

## Phone notes

- 100dvh layout, `visualViewport` keeps the text box above the keyboard, 48px+ tap targets, autocorrect off (so students' own mistakes are checked).
- Drafts are saved on the phone and in the room: a reload or a lost connection never loses a sentence. A draft is auto-submitted when time runs out.
- The screen stays awake while writing (Wake Lock, where supported). A small dot shows the connection.

---

Characters and pictures are original, drawn in SVG for this game. Chó is based on the teacher's own cat drawing.
