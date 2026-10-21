# Deploying the public demo on Render

The demo is the `demo` build: fictional data, Google Calendar disabled server-side, strict AI rate limits.
Your personal copy runs on your own machine (see README) and is never deployed.

## 1. Push to GitHub
```bash
git init && git add -A && git commit -m "Efficiance"
git branch -M main
git remote add origin https://github.com/<you>/efficiance.git
git push -u origin main
```
Check first: `.env` and `.google-tokens.json` must not be tracked (`git status`). They are git-ignored.

## 2. Get an AI key (free)
Create a Gemini key at https://aistudio.google.com/apikey. Never paste it into the repo or chat; it goes only in Render's dashboard.
Optionally set a quota/budget alert in Google AI Studio.

## 3. Render Blueprint
1. render.com → **New + → Blueprint** → choose the repo (it reads `render.yaml`).
2. When prompted, enter `GEMINI_API_KEY`.
3. Deploy. You get `https://efficiance-xxxx.onrender.com`.
4. Verify: `/api/health` → `{"ok":true,"service":"efficiance","mode":"demo"}`.

## 4. Keep it awake (free tier sleeps after ~15 min idle)
Create a free monitor at uptimerobot.com: HTTP(s), URL `https://<your-app>.onrender.com/api/health`, interval 5 min.
A single always-on free service fits Render's monthly free instance hours.

## 5. Profile links
Edit `src/config.js` (`PROFILE`) with your GitHub/LinkedIn/email; empty values hide their buttons. Push to redeploy.

## Cost & abuse controls
Defaults in demo mode: 4 live-AI calls per visitor per hour, 10 per day, 150 per day overall, 8 KB input, 1.5K output tokens.
Override with `AI_LIMIT_PER_IP_HOUR`, `AI_LIMIT_PER_IP_DAY`, `AI_LIMIT_GLOBAL_DAY`. Beyond the limits visitors still see the saved insights.

## Environment variables
| Var | Notes |
|---|---|
| `APP_MODE` | `demo` (set in render.yaml) or `personal` |
| `AI_PROVIDER` | `gemini` or `openai` (any OpenAI-compatible API) |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` | Secret; set in the dashboard |
| `AI_MODEL` | e.g. `gemini-2.5-flash-lite` |
| `TRUST_PROXY` | Proxy hops to trust for client IPs (default 1) |
