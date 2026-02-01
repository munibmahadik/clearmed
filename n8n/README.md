# n8n workflows

**Pipeline:** Scan (home) → **n8n workflow** → Results page. Calling n8n is the goal: the app triggers your “process doctor’s note” workflow and shows its output.

This folder holds **workflow JSON files** so they live in the same repo as the app. Everything stays in one place.

---

## Medical Agent Backend (webhook, free trial)

The **medback** workflow uses a Webhook trigger and works on n8n cloud free trial.

**Flow:** Webhook (POST /dizzy) → Code (extract image) → Basic LLM Chain (Gemini, imageBinary) → **Parse Guardian** (parse JSON) → ElevenLabs TTS (HTTP Request) → Prepare Response (binary→base64 + checklist) → Respond to Webhook.

**Setup:** Import `medback.json`, activate the workflow, set `N8N_WEBHOOK_URL` to your webhook URL (e.g. `https://your-instance.app.n8n.cloud/webhook/dizzy`) in `.env.local`. App sends image as multipart with field `image`. In the **HTTP Request** node, set ElevenLabs API key (Header Auth: `xi-api-key`) and optionally change the voice ID—**Rachel** is `21m00Tcm4TlvDq8ikWAM` (calm American English).

---

## shubham_workflow.json (Guardian + optional Discord)

Same pipeline as medback plus a **Guardian** (hallucination check) branch and optional **Discord** alert when Guardian fails. Webhook path is **dizzy**.

**Discord (optional):** The workflow only calls Discord when a webhook URL is set. In n8n: open the workflow → **Settings** (gear) → **Static Data** → add key `discordWebhookUrl` with value your full Discord webhook URL (e.g. `https://discord.com/api/webhooks/123456789/your_token`). Get the URL from Discord: Server → Integrations → Webhooks → New Webhook → Copy webhook URL. If you leave it unset, the Discord node is skipped and you won’t get the 400 “webhook_id is not snowflake” error.

---

## How the app calls n8n

1. User taps **Scan** on the home page → `POST /api/scan` runs.
2. The scan API **triggers the n8n workflow** (ID from `N8N_WORKFLOW_ID_SCAN`) and returns an `executionId`.
3. User is sent to `/results?executionId=...`.
4. The results page loads data from that execution (via `GET /api/results?executionId=...`), which calls n8n’s execution API and parses the last node’s output into checklist + optional audio URL.

**Env (see `.env.example`):** `N8N_BASE_URL`, `N8N_API_KEY`, `N8N_WORKFLOW_ID_SCAN`. Without them, the app uses demo data (executionId `"demo"`).

**Workflow output shape** the app expects (see `lib/n8n.ts` → `ScanResultPayload`):

- `checklist`: `{ text: string, checked: boolean }[]`
- `summary?`: string (or `text`)
- `audioUrl?`: string (optional; if no hosting)
- `audio_base64?`: string — Base64-encoded MP3 from ElevenLabs; app converts to blob URL for playback
- `verifiedSafe?`: boolean  

The app also supports **raw medical output** `{ Diagnosis, Medications, Warning Signs }` — it transforms it into the checklist shape automatically. **Respond to Webhook** should return `{ summary, checklist, audio_base64 }` so the PWA can show text and play audio without an S3 bucket.

---

## Adding workflows from your friend’s laptop

1. **Export from n8n (your friend’s side)**  
   In the n8n editor: open the workflow → **⋮ (menu)** → **Download** → save the `.json` file.

2. **Put the file here**  
   Copy the JSON file into this `n8n/` folder (e.g. `n8n/scan-workflow.json`).

3. **Commit and push**  
   Add, commit, and push so the workflow is in the GitHub repo with the rest of the project.

**Import on your side:** In your n8n instance: **⋮** → **Import from File** → choose the JSON from this folder.

---

## Summary

| Goal | What to do |
|------|------------|
| Pipeline: Scan → n8n → Results | Set `N8N_BASE_URL`, `N8N_API_KEY`, `N8N_WORKFLOW_ID_SCAN`; workflow last node returns `checklist` (and optional `audioUrl`, `summary`, `verifiedSafe`). |
| Have workflows in one place | Put exported workflow JSONs in this `n8n/` folder and commit. |
| Share with your friend | Push to GitHub; he can pull and import the JSONs into his n8n. |
