# Add only chatbot-related code from axlegeek to current branch.
# Run from repo root. Typically:
#   git fetch origin
#   git checkout main
#   git pull origin main
#   .\scripts\add-chatbot-to-main.ps1
# Then: git add . ; git status ; git commit -m "Add chatbot: chat page, API, nav link, Ask about report"
# Then: git push origin main  (or push branch and open PR)

$chatbotFiles = @(
  "app/chat/page.tsx",
  "app/api/chat/route.ts",
  "components/chat-view.tsx",
  "components/navbar.tsx",
  "app/results/page.tsx"
)

Write-Host "Checking out chatbot files from axlegeek..."
foreach ($f in $chatbotFiles) {
  if (Test-Path $f -PathType Leaf) {
    git checkout axlegeek -- $f
    Write-Host "  $f"
  } else {
    # Directory or new file - parent might exist
    git checkout axlegeek -- $f 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "  $f" } else { Write-Host "  $f (skip: not found)" }
  }
}

Write-Host ""
Write-Host "Done. Next:"
Write-Host "  git add ."
Write-Host "  git status"
Write-Host "  git commit -m \"Add chatbot: chat page, API, nav link, Ask about report\""
Write-Host "  git push origin main   (or push your branch and open PR)"
