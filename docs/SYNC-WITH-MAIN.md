# Sync your branch with latest main (14 behind, 1 ahead)

Goal: get the latest `main` into your branch so you're up to date, and keep your 1 commit.

## Option A: Merge (recommended)

```powershell
# 1. Make sure you're on your branch
git checkout axlegeek

# 2. Get latest from remote
git fetch origin

# 3. Merge latest main into your branch
git merge origin/main
```

- If there are **no conflicts**: you're done. Then push: `git push origin axlegeek`
- If there are **conflicts**: use the union/override strategy (see below), then push.

After this, your branch will have all 14 commits from main plus your 1 commit (and possibly a merge commit). You won't be "14 behind" anymore.

---

## Option B: Rebase (linear history)

Puts your 1 commit on top of the latest main (no merge commit):

```powershell
git checkout axlegeek
git fetch origin
git rebase origin/main
```

If conflicts appear, fix them, then `git add <file>`, `git rebase --continue`.  
When done: `git push origin axlegeek --force-with-lease` (force needed because you rewrote history).

---

## If you get merge conflicts

1. Run the union/override script so only `app/page.tsx` and `components/navbar.tsx` need manual merging:
   ```powershell
   .\scripts\merge-union.ps1
   ```
2. Resolve `app/page.tsx` and `components/navbar.tsx` by hand (combine both sides).
3. Finish:
   ```powershell
   git add app/page.tsx components/navbar.tsx
   git commit -m "Merge main; union page and navbar, override rest"
   git push origin axlegeek
   ```
