# n8n workflows

**Pipeline:** Scan (home) → **n8n workflow** → Results page. Calling n8n is the goal: the app triggers your “process doctor’s note” workflow and shows its output.

This folder holds **workflow JSON files** so they live in the same repo as the app. Everything stays in one place.

---

## Medical Agent Backend (webhook, free trial)

The **Medical Agent Backend** workflow uses a Webhook trigger and works on n8n cloud free trial.

**Flow:** Webhook (POST /scan) → Basic LLM Chain (Gemini, imageBinary) → Code (parse JSON) → ElevenLabs TTS → Respond to Webhook

**Setup:** Import `Medical Agent Backend.json`, activate, set `N8N_WEBHOOK_URL=https://axlegeek.app.n8n.cloud/webhook/scan` in `.env.local`. App sends image as multipart with field `image`.

---

## How the app calls n8n

1. User taps **Scan** on the home page → `POST /api/scan` runs.
2. The scan API **triggers the n8n workflow** (ID from `N8N_WORKFLOW_ID_SCAN`) and returns an `executionId`.
3. User is sent to `/results?executionId=...`.
4. The results page loads data from that execution (via `GET /api/results?executionId=...`), which calls n8n’s execution API and parses the last node’s output into checklist + optional audio URL.

**Env (see `.env.example`):** `N8N_BASE_URL`, `N8N_API_KEY`, `N8N_WORKFLOW_ID_SCAN`. Without them, the app uses demo data (executionId `"demo"`).

**Workflow output shape** the app expects (see `lib/n8n.ts` → `ScanResultPayload`):

- `checklist`: `{ text: string, checked: boolean }[]`
- `summary?`: string  
- `audioUrl?`: string  
- `verifiedSafe?`: boolean  

The app also supports **raw medical output** `{ Diagnosis, Medications, Warning Signs }` — it transforms it into the checklist shape automatically.

### Current workflow (workflow.json) — recommended tweaks

1. **Trigger input** — Add field `image` (String, required) in the Execute Workflow Trigger schema.
2. **Image → LLM** — If Basic LLM Chain expects `imageBinary`, add a Code node after the trigger to convert base64 from `$json.image`/`$json.data.image` to binary.
3. **ElevenLabs body** — Use `$json.summary` (or the summary text) for `text`, not `JSON.stringify($json)`.
4. **Transform (optional)** — Add a Code node between "Code in JavaScript" and "HTTP Request" that outputs `{ checklist, summary, verifiedSafe }` for finer control.
5. **Audio URL** — The HTTP Request returns binary; for `audioUrl` you’d need to upload to S3/Cloudinary and return the URL.

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
