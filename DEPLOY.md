# Deployment

End-to-end deployment of the Jiya Persona stack:

- **Backend** → Render (Docker, free tier with keep-warm cron OR $7/mo warm tier)
- **Frontend** → Vercel (Next 14)
- **Voice assistant** → Vapi (custom-LLM URL points at Render backend)

You should already have:

- The repo at <https://github.com/jiya-singhal/jiya-persona> (public)
- A Render account with the GitHub integration approved
- A Vercel account with the GitHub integration approved
- A Vapi dashboard account
- API keys ready: `GEMINI_API_KEY`, `VOYAGE_API_KEY`, `GITHUB_TOKEN`,
  `CALCOM_API_KEY`, `CALCOM_EVENT_TYPE_ID`, `VAPI_API_KEY`

> **Note:** the RAG corpus (`backend/data/chroma_db/`, `repo_cards/`,
> `resume.pdf`) is committed to the repo and ships inside the Docker image.
> Render does NOT regenerate it on boot. To refresh after a code or
> resume change, run `python -m app.scripts.reingest` locally and commit the
> updated `data/` directory.

---

## Step 1 — Push to GitHub

From the repo root:

```bash
git init
git add .
git commit -m "Phase 1-6 complete: RAG + chat + booking + voice + frontend"
git branch -M main
git remote add origin git@github.com:jiya-singhal/jiya-persona.git
git push -u origin main
```

If `git push` complains about size, check that `backend/data/chroma_db/`
got committed (`du -sh backend/data/chroma_db/` should show ~5 MB).

---

## Step 2 — Deploy backend to Render

1. Go to <https://dashboard.render.com/>.
2. Click **New +** → **Blueprint**.
3. Connect the `jiya-singhal/jiya-persona` repo.
4. Render auto-detects `backend/render.yaml`. Click **Apply**.
5. After the service is created, go to the service page → **Environment** tab.
6. For each `sync: false` env var, click **Edit** and paste the value:
   - `GEMINI_API_KEY` = your Google AI Studio key
   - `VOYAGE_API_KEY` = your Voyage key
   - `GITHUB_TOKEN` = classic PAT with `public_repo` scope
   - `CALCOM_API_KEY` = `cal_live_...`
   - `CALCOM_EVENT_TYPE_ID` = `5575186`
   - `VAPI_API_KEY` = your Vapi key (only needed for /vapi/tool webhook auth)
   - `BACKEND_URL` = the public URL Render assigns once deployed
     (you'll fill this in after first deploy completes — see step 8)
   - `FRONTEND_URL` = the Vercel URL (fill in after step 4)
7. Click **Manual Deploy** → **Deploy latest commit**. First build takes
   3–5 min (Docker layer caching is cold).
8. Once deployed, copy the URL (something like
   `https://jiya-persona-backend.onrender.com`). Verify it works:
   ```bash
   curl https://jiya-persona-backend.onrender.com/health
   # {"status":"ok"}
   ```
9. Go back to the **Environment** tab and update `BACKEND_URL` to that URL.
   Trigger one more redeploy so the env var is picked up. (Not strictly
   required since the backend doesn't read `BACKEND_URL` itself, but keeps
   things consistent.)

### Free-tier cold starts

Render's free tier puts the service to sleep after ~15 min idle, then takes
30–60s to wake. For Vapi voice calls this is a deal-breaker. Two options:

**(A)** Upgrade to the $7/mo "Starter" plan. Always warm. Recommended for
the eval window.

**(B)** Stay on free, add a keep-warm cron. Use
<https://cron-job.org/> (free) to ping `https://your-render-url/health`
every 5 minutes. Render's free tier allows unlimited inbound traffic; this
keeps the instance warm during business hours. Tweak the cron schedule to
your eval window if you want to save free-tier hours.

---

## Step 3 — Deploy frontend to Vercel

1. Go to <https://vercel.com/new>.
2. Import the `jiya-singhal/jiya-persona` repo.
3. Vercel detects Next.js automatically. In **Configure Project**:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js (auto-detected)
   - **Environment Variables:** add
     `BACKEND_URL` = `https://jiya-persona-backend.onrender.com` (from step 2.8)
4. Click **Deploy**. Build takes 1–2 min.
5. Once deployed, copy the URL (something like
   `https://jiya-persona.vercel.app`). Test it in a browser.
6. Update Render's `FRONTEND_URL` env var to this URL (Render → Environment →
   Edit `FRONTEND_URL`). This is informational; the backend doesn't enforce
   CORS strictly today, but it'll be useful for Phase 8 polish.

---

## Step 4 — Wire Vapi to prod backend

1. In `vapi/assistant_config.json`, replace
   `REPLACE_WITH_YOUR_PUBLIC_BACKEND_URL` with your Render URL.
   Vapi calls `<url>/v1/chat/completions`, so set `model.url` to the
   **base URL** (no path).
2. Follow `vapi/SETUP.md` Step 2 onward to create the assistant.
3. Update `backend/.env` and Render env var `VAPI_ASSISTANT_ID` with the
   ID Vapi shows after assistant creation. (Local-only convenience; the
   backend doesn't read it.)

---

## Step 5 — Prod smoke test

From your laptop, hit the prod backend directly:

```bash
# 1. Health
curl https://jiya-persona-backend.onrender.com/health

# 2. Chat
curl -N -X POST https://jiya-persona-backend.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What did Jiya do at SingOneSong?"}'

# 3. Voice (OpenAI shim)
curl -X POST https://jiya-persona-backend.onrender.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-2.5-flash-lite","messages":[{"role":"user","content":"hi"}],"stream":false}'
```

Then open the Vercel frontend URL and run a full chat → booking conversation.
Finally, in the Vapi dashboard, click **"Talk"** on the assistant and have
a real voice conversation. Pull latency stats from Render shell:

```bash
# In Render dashboard → backend service → Shell
python -c "from app.telemetry.latency_log import summary; import json; print(json.dumps(summary(), indent=2))"
```

---

## Troubleshooting

- **Render build fails with "Cannot find package 'app'"** → confirm
  `pyproject.toml` has `[tool.hatch.build.targets.wheel] packages = ["app"]`.
- **Render "no healthCheckPath" warning** → that's a free-tier nag,
  ignore (we have it set in render.yaml).
- **Frontend "Upstream error 502"** → backend is asleep. Hit `/health`
  manually to wake it, then refresh. Set up the keep-warm cron from Step 2.
- **Vapi reports "model returned 500"** → check Render logs. Most likely
  one of the env vars is missing or wrong. Re-paste from your local `.env`.
