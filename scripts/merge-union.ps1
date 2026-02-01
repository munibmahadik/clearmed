# Run during a merge with conflicts.
# Union (leave for manual merge): app/page.tsx, components/navbar.tsx
# Override (take --ours): all other conflicted files.
# Usage: .\scripts\merge-union.ps1 [--theirs]
#   Default: --ours (keep current branch for override files)
#   --theirs: keep incoming branch for override files

param([switch]$Theirs)

$unionFiles = @("app/page.tsx", "components/navbar.tsx")
$conflicted = git diff --name-only --diff-filter=U 2>$null
if (-not $conflicted) {
  Write-Host "No conflicted files. Nothing to do."
  exit 0
}

$side = if ($Theirs) { "--theirs" } else { "--ours" }
Write-Host "Override files (using $side):"
foreach ($f in $conflicted) {
  if ($unionFiles -notcontains $f) {
    git checkout $side -- $f
    git add $f
    Write-Host "  $f"
  }
}
Write-Host ""
Write-Host "Union files (resolve manually):"
foreach ($f in $unionFiles) {
  if ($conflicted -contains $f) {
    Write-Host "  $f"
  }
}
Write-Host ""
Write-Host "Next: edit the union files, then: git add app/page.tsx components/navbar.tsx; git commit"
