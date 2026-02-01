# Merge Junaidali into Main (Keep Auth + History from Junaidali, Rest from Main)

This guide helps you merge branch **Junaidali** into **main** so that:
- **From Junaidali:** Account creation / sign-in and History features are kept.
- **From main:** All other functionality stays as on main.

---

## Strategy: Merge Junaidali into main, then resolve conflicts

1. Update both branches.
2. Merge `Junaidali` into `main`.
3. Resolve conflicts by choosing the correct side per file (see lists below).

---

## Step-by-step commands

Run these from the project root (e.g. `C:\Junaidali\clearmed` or your repo path).

### 1. Fetch and ensure you have both branches

```powershell
git fetch origin
git checkout main
git pull origin main
git checkout Junaidali
git pull origin Junaidali
```

### 2. Start the merge (main gets Junaidali’s changes)

```powershell
git checkout main
git merge Junaidali
```

If Git reports "Already up to date", then main already has Junaidali’s commits; you’re done.

If Git reports conflicts, continue below.

### 3. Resolve conflicts using the lists below

When there are conflicts, open each conflicted file and choose:

- **Keep Junaidali’s version** for: **Auth + History** files (list A).
- **Keep main’s version** for: **Everything else** (list B).

---

## List A: Keep Junaidali’s version (Auth + History)

When a file below is in conflict, keep the **Junaidali** side (e.g. in VS Code/Cursor choose “Accept Incoming” for the merge from Junaidali into main, or manually keep the Junaidali version).

**Auth**
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/auth/oauth-enabled/route.ts`
- `app/api/auth/register/route.ts`
- `app/layout.tsx` (has `Providers` for NextAuth)
- `app/page.tsx` (auth gate + home content)
- `components/auth-gate.tsx`
- `components/home-content.tsx`
- `components/providers.tsx`
- `components/navbar.tsx` (sign-in, History only when signed in, Sign out)
- `lib/auth.ts`
- `lib/auth-store.ts`
- `app/api/scan/route.ts` (session check at top)
- `types/next-auth.d.ts`

**History**
- `app/api/history/route.ts`
- `app/history/page.tsx`
- `components/history-list.tsx`
- `lib/history-store.ts`
- `components/scan-button.tsx` (history recording + any auth-related UI)
- `hooks/useMedicalScan.ts` (history recording)

**Env / config (optional; keep Junaidali if you added auth/history vars)**
- `.env.example` (if Junaidali added `AUTH_SECRET`, `NEXTAUTH_URL`, etc.)

---

## List B: Keep main’s version (rest of app)

For any other conflicted file not in List A, keep **main**’s version so that “rest of functionalities remain the same as in main”. Examples:

- `app/chat/page.tsx`
- `app/results/page.tsx`
- `app/api/chat/route.ts`
- `app/api/results/route.ts`
- `lib/n8n.ts`
- `components/chat-view.tsx`
- `components/results-card.tsx`
- `components/results-view.tsx`
- `components/scan-actions.tsx` (if it exists only on main)
- `docs/*` (except this merge guide if you want to keep it)
- Any other file not listed in List A

---

## 4. After resolving all conflicts

```powershell
git add .
git status
```

Fix any remaining conflicts until `git status` shows no “Unmerged paths”.

Then complete the merge:

```powershell
git commit -m "Merge Junaidali into main: keep auth and history from Junaidali, rest from main"
git push origin main
```

---

## 5. If you prefer to keep main’s layout/page structure

If `app/page.tsx` or `app/layout.tsx` on **main** has a different structure (e.g. different layout or home content), you can:

- Keep **main**’s `app/page.tsx` / `app/layout.tsx` structure, **then** re-apply only the auth/history pieces from Junaidali (e.g. wrap app in `Providers`, add `HomeContent`/auth gate, and History link when signed in).  
- Use List A for the auth and history **components** and **API** files, and List B for the **page** files; then manually re-add the auth gate and History behavior into the main branch’s pages.

---

## Quick reference

| Goal                         | Branch to keep in conflict |
|-----------------------------|----------------------------|
| Auth + History (List A)     | **Junaidali**              |
| Everything else (List B)    | **main**                   |
