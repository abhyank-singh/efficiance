# Extending Efficiance

A map of where things live, so new features are small changes.

## Re-skin the app (palette)
All colours are CSS variables in the `:root` block at the top of `src/styles.css` ("Forest Calm" today).
Change `--a1`, `--a2`, `--bg`, `--text`… and the whole app follows. `src/theme.js` maps them to JS tokens
(`C.blue`, `grad`, `glassPrimary`, `glassSoft`). The share-card image (`src/pages/Recap.jsx`) and the PNG icons
in `public/` use fixed colours because they are rendered outside the page; update those by hand.

## Buttons and motion
- Primary buttons spread `...glassPrimary` from `src/theme.js`; secondary pills use the `bd-hover` class or `glassSoft`.
- 3D card tilt: add class `card-hover` to any card (logic in `src/motion.js`).
- Stagger: automatic for page blocks and grid children (CSS in `styles.css`, wrapper in `Shell.jsx`).
- Count-up numbers: wrap a formatted string, `<CountUp text="₹14,250" />`.
- All motion respects the system "reduce motion" setting.

## Add a new page / module
1. Create `src/pages/MyModule.jsx`.
2. Add a `<Route>` in `src/App.jsx` and an entry in `navDefs` / `moreDefs` in `src/components/Shell.jsx`.
3. Keep its state in `src/store.jsx` (`initial`), read with `useApp()`.

## Add an instrument to Music
`src/data/music.js`: set `ready: true` on the instrument. `src/pages/Music.jsx`: write a panel component and
register it in `PANELS`. Practice minutes already flow into streaks, Recap and Quick Add.

## Teach Quick Add a new action
1. `shared/schema.js`: add the type to `ACTION_TYPES` and a validator case in `sanitizeAction`.
2. `src/data/actions.js`: add a `describe()` line, an `applyOne()` case, and (optionally) a rule in `parseClause()` so it works offline.
3. `server/parse.js`: add the action shape to the system prompt.
Every action is validated on the server and again in the browser before it touches state.

## Add an AI provider or model
`server/ai.js` (env: `AI_PROVIDER`, `AI_MODEL`, `GEMINI_API_KEY` / `OPENAI_*`). Any OpenAI-compatible API works, including local Ollama.

## Metrics
`track('event_name')` from `src/track.js`. Set `VITE_GOATCOUNTER` at build time to also send anonymous events.

## Public demo vs personal build
`VITE_APP_MODE=demo` (public) or unset (personal). See `src/config.js`. In demo mode Google Calendar is disabled server-side.
