# Project Handoff — Personal Calendar / Movies / Reads App

A small personal multi-page site: a monthly calendar with per-day notes, a movie list, and a reading list (school PDFs / articles). Built in plain HTML/CSS/JS, no framework, no build step. Originally used `localStorage`; now backed by a shared Supabase (Postgres) database. Gated behind a simple site-wide password — intentionally *not* real security, just a deterrent (owner's explicit call: "I don't really care for building security in a place like this").

## Files

| File | Purpose |
|---|---|
| `main.html` | Landing page. Also where the site-wide password gate lives. |
| `movies.html` | Add / view detail / remove films. Backed by the `films` table. |
| `reads.html` | Add / view detail / remove reads. Backed by the `reads` table. No cover art by design — these are personal PDFs/articles, not movies. Clicking a card opens a link (direct PDF or a website) in a new tab. |
| `calendary.html` | Month-view calendar. Click a day to add/edit/delete notes (title + body, multiple per day). Backed by the `calendar_notes` table. |
| `mycss.css` | Single shared dark-theme stylesheet used by every page. |
| `supabaseClient.js` | Shared Supabase client init — holds the Project URL + anon key in one place, loaded before each page's own script. |
| `authGate.js` | Shared guard loaded first in `<head>` of `movies.html`, `reads.html`, `calendary.html`. Redirects to `main.html` if the site hasn't been unlocked on this device, so the password can't be bypassed by typing a direct URL. |

## Database (Supabase)

- Project ref: `bkqeohmgspmtahcxsyfu`
- Project URL: `https://bkqeohmgspmtahcxsyfu.supabase.co`
- anon public key (meant to be public-facing, already embedded in `supabaseClient.js`):
  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWVvaG1nc3BtdGFoY3hzeWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MzgxNjAsImV4cCI6MjEwNDIxNDE2MH0.AnMgeOYFOG5iOWWKkcj689xbD_O6JBt7k5hIoc1yGJg`
- The database password is intentionally **not** recorded anywhere in the project — it's not needed for the anon-key/REST approach used throughout, and the owner is keeping it separately.

### Schema

```sql
calendar_notes (id uuid pk, note_date date, title text, body text, created_at timestamptz)
films          (id uuid pk, name text, description text nullable, created_at timestamptz)
reads          (id uuid pk, name text, link text, created_at timestamptz)
```

- RLS is **enabled but fully permissive** (`for all using (true) with check (true)` on every table, plus explicit grants to `anon`/`authenticated`). This was a deliberate, discussed trade-off: no user accounts, single shared dataset, personal project on an obscure URL. Known limitation: anyone with the URL + anon key (visible in any page's source) can read *and write* everything.
- Free-tier Supabase projects auto-pause after 7 days with zero API requests; needs a manual resume from the dashboard if it goes quiet for a while.

## Site-wide password gate (two roles)

- Two passwords, mapped to two roles, both hardcoded in `main.html`'s inline script (`roleByPassword` object):
  - `Biblioteconomia` → `viewer` — can browse everything (calendar notes, films, reads) but sees no add/edit/delete controls.
  - `Representantes` → `admin` — full add/edit/delete access across calendar notes, films, and reads. Framed as "the administrators."
- Role persists in `localStorage` under the key `site-role` (`'viewer'` or `'admin'`).
- `main.html`: centered padlock icon + password `<form>` (`.lock-screen`, CSS scoped under `.main-page`) until a valid password is entered. Either role unlocks the same way — reveals the header arrow + slide-out nav menu.
- `authGate.js`: guards `movies.html`, `reads.html`, `calendary.html`. Redirects to `main.html` via `location.replace` unless `site-role` is `'viewer'` or `'admin'`. Loaded first in each page's `<head>`, and its top-level `const siteRole` is read directly by each page's own script afterward (classic `<script>` tags share global scope, so no need to re-read `localStorage` a second time).
- Each admin-only control is hidden per-page based on `const isAdmin = siteRole === 'admin'`:
  - `movies.html` / `reads.html`: the "+" add button and the remove button in the detail dialog.
  - `calendary.html`: the "Nova nota" button and each note's edit/delete buttons (simply omitted from the rendered HTML for viewers).
- **Important limitation, worth remembering:** this is a UI-only permission layer. The database's RLS policies are still fully open (see below) — a viewer who opened dev tools and called the Supabase client directly could still write. The role system stops a non-technical viewer from seeing edit controls; it does not stop a determined one at the database level. Consistent with the project's stated "don't care about real security here" stance, but worth knowing if that stance ever changes.

## Calendar notes are now always expanded

Note bodies used to be collapsed behind a click on the note's title. That's gone — opening a day now shows every note's full title and body immediately, no extra click needed. `.note-header` changed from a clickable `<button>` to a static `<p>` label accordingly.

## Key decisions and why (in case they need revisiting)

- Removed an unintentional 700px mobile media query from `mycss.css` — it switched the calendar grid to 3 columns without adjusting row count, breaking the day-cell layout. The app is desktop-only by choice; centered/max-width layout (`width: min(1120px, 100%)`) already works fine at any window size, it just doesn't stretch.
- Changed `body { overflow: hidden }` → `overflow-y: auto` so a short/zoomed window gets a scrollbar instead of silently clipping unreachable content.
- Reads store `{ name, link }` rather than a cover image — matches the plan to eventually populate them from the owner's own database of school PDFs/articles.
- `movies.html`, `reads.html`, `calendary.html` each fetch their Supabase data once into an in-memory array/cache (`currentFilms`, `currentReads`, `allNotes`) on load, then re-fetch + re-render after any insert/update/delete, rather than round-tripping on every click.
- `calendary.html` was the most involved conversion: went from one `localStorage` key per day holding an array of notes, to one Supabase row per individual note, matched to a day via an ISO `note_date` (`YYYY-MM-DD`) string and filtered client-side out of the single full-table `allNotes` fetch.

## Open items / not yet decided

- Final hosting choice isn't locked in. InfinityFree (free PHP/MySQL host) was considered before the DB moved to Supabase; now that the backend is Supabase, any static host works (InfinityFree just for the static files, GitHub Pages, Netlify, etc.).
- RLS lockdown / real auth was discussed as a "later, if it ever matters" item — not being pursued now by explicit choice.
- UI copy is in Portuguese (pt-BR) throughout — keep any new UI text consistent with that.

## Working style notes

- Owner works in VS Code.
- Prefers simple over secure when the two trade off, for this project specifically.
- Likes minimal, boxy, dark UI — plain unicode characters/emoji for icons (`&larr;`, `&times;`, 🔒) rather than icon fonts or SVGs, consistent with the rest of the app.
