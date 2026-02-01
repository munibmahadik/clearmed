# Add only chatbot code from axlegeek to main

Use this to bring **only** the chatbot functionality from `axlegeek` into `main` (no other axlegeek changes).

## Chatbot-related files (from axlegeek)

- `app/chat/page.tsx` – Chat page
- `app/api/chat/route.ts` – Chat API (OpenAI)
- `components/chat-view.tsx` – Chat UI
- `components/navbar.tsx` – Chat tab in nav
- `app/results/page.tsx` – “Ask about this report” link + executionId handling
- `.env.example` – OPENAI_API_KEY placeholder (optional)

## Steps

Run from repo root. Make sure you have no uncommitted changes you care about (or stash them).

### 1. Update main and your branch

```powershell
git fetch origin
git checkout main
git pull origin main
```

### 2. Create a branch for the chatbot-only merge

```powershell
git checkout -b add-chatbot
```

### 3. Take only chatbot files from axlegeek

```powershell
git checkout axlegeek -- app/chat/page.tsx app/api/chat/route.ts components/chat-view.tsx components/navbar.tsx app/results/page.tsx
```

Optional (if you want the .env.example chat line on main):

```powershell
git checkout axlegeek -- .env.example
```

### 4. Commit

```powershell
git add .
git status
git commit -m "Add chatbot: chat page, API, nav link, Ask about report"
```

### 5. Merge into main

**Option A – merge branch into main (e.g. for PR):**

```powershell
git checkout main
git merge add-chatbot
git push origin main
```

**Option B – push branch and open PR:**

```powershell
git push origin add-chatbot
```

Then on GitHub: open a PR from `add-chatbot` into `main`, review, and merge.

---

## If main changed the same files

If `main` has different versions of `navbar.tsx` or `app/results/page.tsx`, checking out from axlegeek overwrites them. If you need to **keep main’s version and only add** the Chat link or “Ask about this report” block, then:

1. Do **not** run `git checkout axlegeek -- components/navbar.tsx app/results/page.tsx`.
2. After step 3, manually edit `components/navbar.tsx` and `app/results/page.tsx` on `add-chatbot` to add only the Chat tab and the “Ask about this report” section (copy from axlegeek).
3. Then commit and merge as above.
