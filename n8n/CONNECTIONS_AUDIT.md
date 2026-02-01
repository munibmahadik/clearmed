# n8n medback Workflow - Connection Audit

Use this to verify all connections in your n8n workflow before scanning.

## Main Data Flow

| From Node | To Node | Purpose |
|-----------|---------|---------|
| **Webhook1** | Code in JavaScript1 | Receives image/PDF from app |
| **Code in JavaScript1** | Basic LLM Chain | Passes binary image to OpenAI OCR |
| **Basic LLM Chain** | Code in JavaScript | Raw extraction JSON from OCR |
| **Code in JavaScript** | Format Draft Prompt | Parsed extraction → prompt for Draft |
| **Format Draft Prompt** | Draft Chain | Patient-friendly conversion prompt |
| **Draft Chain** | Parse Draft | Draft output → checklist + audio_script |
| **Parse Draft** | Format Guardian Prompt | Draft output for Guardian comparison |
| **Format Guardian Prompt** | Guardian Chain | Hallucination check prompt |
| **Guardian Chain** | Parse Guardian | Pass/fail + reason |
| **Parse Guardian** | IF Guardian Fail | Route on pass/fail (branch 1) |
| **Parse Guardian** | HTTP Request | audio_script → ElevenLabs TTS (branch 2) |
| **IF Guardian Fail** (true) | Anonymize | When Guardian fails |
| **Anonymize** | Discord Webhook | Alert doctor |
| **HTTP Request** | Prepare Response | Merge audio + checklist + verifiedSafe |
| **Prepare Response** | Respond to Webhook | Return JSON to app |

## Model Connections (OpenAI Chat Model →)

- Basic LLM Chain (OCR extraction)
- Draft Chain (patient-friendly checklist)
- Guardian Chain (hallucination check)

## Common Mistakes to Avoid

1. **Format Guardian Prompt** must receive from **Parse Draft** (NOT from Code in JavaScript or Format Draft Prompt)
2. **Format Guardian Prompt** must connect to **Guardian Chain** (NOT to IF Guardian Fail)
3. **IF Guardian Fail** receives only from **Parse Guardian** (NOT from Format Guardian Prompt)
4. **Draft Chain** receives from **Format Draft Prompt** (NOT from Code in JavaScript directly)
5. **HTTP Request** receives from **Parse Draft** (needs audio_script from Draft output)

## Visual Flow Summary (Sequential - Fixed)

```
Webhook1 → Code in JavaScript1 → Basic LLM Chain → Code in JavaScript
                                                         ↓
                                              Format Draft Prompt
                                                         ↓
                                                   Draft Chain
                                                         ↓
                                                   Parse Draft
                                                         ↓
                                            Format Guardian Prompt
                                                         ↓
                                                 Guardian Chain
                                                         ↓
                                                 Parse Guardian
                                                    ↙     ↘
                                     IF Guardian Fail    HTTP Request
                                            ↓                  ↓
                                      Anonymize        Prepare Response
                                            ↓                  ↓
                                   Discord Webhook     Respond to Webhook
```

**Key change:** Guardian check now runs BEFORE ElevenLabs audio generation.
This ensures all data is available when Prepare Response runs.
