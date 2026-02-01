# Setup: GitHub repo + n8n in one place

This guide covers creating a GitHub repo for this project and keeping n8n workflows in the same folder so everything is in one place.

---

## 1. Create a GitHub repo and push this folder

### Option A: Using GitHub’s website (no CLI)

1. **Install Git** (if needed): [git-scm.com/download/win](https://git-scm.com/download/win). Restart Cursor/terminal after installing.

2. **Create a new repo on GitHub**
   - Go to [github.com/new](https://github.com/new).
   - Name it (e.g. `clearmed`).
   - Leave “Add a README” **unchecked** (you already have code).
   - Create the repository.

3. **In Cursor, open the integrated terminal** (e.g. `` Ctrl+` ``) and run from the project root:

   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/clearmed.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username (and `clearmed` with your repo name if different).

4. If Git asks for credentials, use a [Personal Access Token](https://github.com/settings/tokens) as the password (not your GitHub password).

### Option B: Using GitHub CLI

1. Install [GitHub CLI](https://cli.github.com/) and run `gh auth login`.

2. From the project root:

   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create clearmed --private --source . --push
   ```

   Use `--public` instead of `--private` if you want a public repo.

---

## 2. Auth (sign-in before scanning)

The app requires sign-in before using the scan feature.

- **Required:** Set `AUTH_SECRET` in `.env.local`. Generate one with: `openssl rand -base64 32`.
- **Email/password:** Works out of the box. Users can “Create an account” or “Sign in to Clearmed” with email and password. Accounts are stored in memory (restart clears them); for production, replace the store in `lib/auth-store.ts` with a database.
- **Google / Apple (optional):** To enable “Continue with Google” or “Continue with Apple”, add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and/or `APPLE_ID`, `APPLE_SECRET` to `.env.local`. See [NextAuth providers](https://next-auth.js.org/providers/) for setup.

---

## 3. n8n in the pipeline

The app pipeline is **Scan → n8n workflow → Results**. The app calls n8n to run the “process doctor’s note” workflow and shows its output on the results page.

- **Store workflow JSONs** in the [`n8n/`](../n8n/) folder (see [n8n/README.md](../n8n/README.md)). Your friend exports from n8n (Editor → ⋮ → Download); you add those JSONs into `n8n/` and commit.
- **Configure n8n:** Set `N8N_BASE_URL`, `N8N_API_KEY`, and `N8N_WORKFLOW_ID_SCAN` in `.env.local` so the scan API triggers the workflow and the results page shows real data. Without them, the app uses demo data.

After you push the repo, set `AUTH_SECRET`, configure n8n (and add workflow JSONs to `n8n/`), you’ll have:
- This project on GitHub.
- The app calling n8n for every scan, with workflows versioned in the same repo.
