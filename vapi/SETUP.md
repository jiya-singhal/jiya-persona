# Vapi setup — Jiya AI Rep

This walks through creating the Vapi assistant that answers a real phone number,
talks to our backend as a custom LLM, and books real meetings on Cal.com.

## What Vapi gets

- **Custom LLM:** our FastAPI backend exposes `/v1/chat/completions` (OpenAI-compatible).
  Vapi calls this for every turn. We wrap Gemini 2.5 Flash on our side.
- **Tools:** `query_knowledge`, `get_availability`, `book_meeting` — declared in
  `assistant_config.json`. Vapi forwards these to our backend; Gemini decides
  when to call them; we resolve them server-side and return results to Gemini,
  which produces the final reply.
- **Voice:** ElevenLabs `eleven_turbo_v2_5` (fast tier per BRIEF §8.8).
- **STT:** Deepgram `nova-2`.

## Prerequisites

- A Vapi account: <https://dashboard.vapi.ai>
- ElevenLabs + Deepgram credentials (Vapi can manage these for you on its
  free tier; you don't need separate keys for testing).
- Backend reachable on a public HTTPS URL. Two ways:
  - **(A) ngrok for local testing**
  - **(B) Render deployment (Phase 6)**

## Step 1 — Get the backend public

### (A) ngrok (quickest)

```bash
# In one terminal:
cd backend
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000

# In another terminal:
ngrok http 8000
```

Copy the `https://<random>.ngrok-free.app` URL. That's your **public
backend URL**. Verify it works:

```bash
curl https://<random>.ngrok-free.app/health
# {"status":"ok"}
```

### (B) Render

After Phase 6, your backend is at `https://jiya-persona-backend.onrender.com`.
Use that.

## Step 2 — Create the Vapi assistant

1. Go to <https://dashboard.vapi.ai/assistants> → **Create Assistant**.
2. Pick **"Blank Template"**.
3. In the assistant config screen, click the **"JSON"** tab and paste the
   contents of `vapi/assistant_config.json` from this repo. Replace
   `REPLACE_WITH_YOUR_PUBLIC_BACKEND_URL` with the URL from Step 1.
   - The full URL Vapi will hit is `<your_url>/v1/chat/completions`.
   - Vapi's "model.url" field expects the **base** (without `/v1/...`).
4. Save.
5. Note the **Assistant ID** that appears in the URL bar — paste it into
   `backend/.env` as `VAPI_ASSISTANT_ID=...`.

## Step 3 — Provision a phone number

1. In the dashboard, go to **Phone Numbers** → **Buy Number** (Twilio is
   free-tier-bundled in Vapi for testing).
2. Choose any US area code (cheapest).
3. After purchase, click the number → **Inbound Settings** → set
   **Assistant** to "Jiya AI Rep".
4. Save.

## Step 4 — Test the assistant from the dashboard (no phone needed)

1. Open the assistant page → click **"Test Assistant"** in the top right.
2. Click **"Talk"** and have a conversation. Try:
   - "Tell me about Jiya's work at SingOneSong" → expect grounded resume answer
   - "What was the swift-f0 work?" → expect 21,750 tests / 98.8%
   - "Can I book a chat next week?" → expect tool call → slots offered
3. Watch the call log on the right side; expand to see **tool calls** as
   Vapi forwards them to our backend.

## Step 5 — Test by phone

Call the number you bought. The assistant picks up, plays the
`firstMessage`, and you can have a real conversation. The exit phrase is
"goodbye" or "thanks, that's all" — covered by Vapi's built-in end-call
detection.

## Step 6 — Latency check

After a few test calls, check our backend's latency log:

```bash
cd backend
.venv/bin/python -c "from app.telemetry.latency_log import summary; import json; print(json.dumps(summary(), indent=2))"
```

You'll see p50/p95 for `retrieval_ms`, `ttft_ms`, `total_ms` for the
`voice` channel. The BRIEF target is **<2s first response**, which maps to
`ttft_ms_p95 < 2000`.

If you're over budget:

- Confirm Vapi is hitting the correct URL (`/v1/chat/completions`, not `/chat`).
- Make sure Render is on a warm tier (cold starts are 30-60s).
- ElevenLabs voice is the turbo model, not multilingual.
- Check `backend/data/latency.sqlite` directly for outliers.

## Troubleshooting

- **Vapi says "model error"** → Check the assistant logs. Most common cause is
  the URL not being publicly reachable. ngrok URLs expire when the tunnel
  closes; restart and update.
- **Tools never get called** → The custom-LLM path means Gemini decides tool
  use, not Vapi. Confirm the prompt asks the model to use them. The system
  prompt in our backend already tells Gemini to call them.
- **Booking creates a Cal.com event but Vapi user doesn't hear confirmation**
  → That's a Gemini response issue, not Cal.com. Check the assistant transcript
  for the tool-call result; if it returned `{"success":true,...}` we're good
  on backend. Reword the system prompt to be more confident about confirming.
