# Merge strategy: union some files, override the rest

When merging (e.g. `main` into `axlegeek`), use this so that:

- **Union (merge both versions manually):** `app/page.tsx`, `components/navbar.tsx`
- **Override (take one version):** all other conflicted files

## Steps

### 1. Start the merge

```powershell
git merge main
# (or: git merge <other-branch>)
```

If there are no conflicts, you're done. If there are conflicts, continue.

### 2. Override all conflicted files except the union list

Keep **your current branch’s version** for every conflicted file except the union files:

```powershell
# List conflicted files
git diff --name-only --diff-filter=U

# Override: use OUR version for everything except page.tsx and navbar.tsx
git diff --name-only --diff-filter=U | ForEach-Object {
  if ($_ -ne "app/page.tsx" -and $_ -ne "components/navbar.tsx") {
    git checkout --ours $_
    git add $_
  }
}
```

To use the **incoming branch’s version** for override files instead, use `--theirs`:

```powershell
git diff --name-only --diff-filter=U | ForEach-Object {
  if ($_ -ne "app/page.tsx" -and $_ -ne "components/navbar.tsx") {
    git checkout --theirs $_
    git add $_
  }
}
```

### 3. Manually union `app/page.tsx` and `components/navbar.tsx`

- Open `app/page.tsx` and `components/navbar.tsx`.
- Resolve conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) by keeping or combining both sides.
- Save, then:

```powershell
git add app/page.tsx components/navbar.tsx
```

### 4. Finish the merge

```powershell
git status
git commit -m "Merge main; union page.tsx and navbar.tsx, override rest"
```

---

**Union files (edit by hand):** `app/page.tsx`, `components/navbar.tsx`  
**Override files (use one side via `--ours` or `--theirs`):** everything else that’s conflicted.
