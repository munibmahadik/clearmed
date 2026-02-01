# n8n workflows

**Pipeline:** Scan (home) → **n8n workflow** → Results page. Calling n8n is the goal: the app triggers your “process doctor’s note” workflow and shows its output.

This folder holds **workflow JSON files** so they live in the same repo as the app. Everything stays in one place.

---

## Medical Agent Backend (webhook, free trial)

The **Medical Agent Backend** workflow uses a Webhook trigger and works on n8n cloud free trial.

**Flow (medback.json):** Webhook → OpenAI OCR (German notes, ICD-10-GM/OPS) → Code (parse) → **Draft Chain** (patient-friendly checklist + audio script) → Parse Draft. In parallel: **Guardian Chain** (hallucination check) → Parse Guardian → **IF** (pass/fail). On FAIL: **Anonymize** → **Discord** webhook. On PASS: ElevenLabs TTS → **Prepare Response** → Respond to Webhook.

**Setup:** Import `medback.json`, activate, set `N8N_WEBHOOK_URL` in `.env.local`. Configure: (1) **OpenAI Chat Model**: Add OpenAI credentials (API key) in n8n, select model (e.g. gpt-4o-mini, gpt-4-turbo) in node parameters; (2) **HTTP Request** (ElevenLabs): Header Auth `xi-api-key`, voice ID `21m00Tcm4TlvDq8ikWAM` (Rachel); (3) **Discord Webhook**: replace the placeholder URL with your real webhook.

**Discord 400 "YOUR_WEBHOOK_ID is not snowflake":** The workflow JSON uses placeholders `YOUR_WEBHOOK_ID` and `YOUR_WEBHOOK_TOKEN`. In n8n, open the **Discord Webhook** node and set the **URL** to your real webhook: `https://discord.com/api/webhooks/<ID>/<TOKEN>`. To get it: Discord server → Server Settings → Integrations → Webhooks → New Webhook (or copy from existing) → Copy webhook URL. Paste that full URL into the node; leave authentication as None.

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

The app also supports **raw medical output** `{ Diagnosis, Medications, Warning Signs }` — it transforms it into the checklist shape automatically. **Respond to Webhook** should return `{ summary, checklist, audio_base64, verifiedSafe }` so the PWA can show text, play audio, and display "Verified Safe" or "Needs Review" based on the Guardian check.

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
