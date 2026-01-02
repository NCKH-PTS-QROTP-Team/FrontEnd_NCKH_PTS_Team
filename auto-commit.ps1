# Auto Git Commit Script - Tạo 100 commits
# Script này sẽ commit từng file riêng lẻ

$targetCommits = 100
$commitMessages = @(
    "feat: Add",
    "fix: Update",
    "refactor: Improve",
    "style: Format",
    "docs: Update",
    "chore: Modify",
    "perf: Optimize",
    "feat: Implement",
    "fix: Resolve",
    "refactor: Restructure"
)

# Khởi tạo git nếu chưa có
if (!(Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Lấy số commit hiện tại
$currentCommits = 0
try {
    $currentCommits = (git rev-list --count HEAD 2>$null)
    if ($LASTEXITCODE -ne 0) { $currentCommits = 0 }
} catch {
    $currentCommits = 0
}

Write-Host "Current commits: $currentCommits" -ForegroundColor Cyan
$commitsNeeded = $targetCommits - $currentCommits

if ($commitsNeeded -le 0) {
    Write-Host "Already have $currentCommits commits. Target reached!" -ForegroundColor Green
    exit 0
}

Write-Host "Need $commitsNeeded more commits to reach $targetCommits" -ForegroundColor Yellow

# Lấy tất cả files trong project (trừ node_modules, .git, etc.)
$allFiles = Get-ChildItem -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch '\\node_modules\\' -and 
        $_.FullName -notmatch '\\.git\\' -and
        $_.FullName -notmatch '\\.expo\\' -and
        $_.FullName -notmatch '\\dist\\' -and
        $_.FullName -notmatch '\\build\\' -and
        $_.Extension -match '\.(tsx?|json|js|css|ts|md)$'
    } | 
    Select-Object -ExpandProperty FullName

Write-Host "Found $($allFiles.Count) files to commit" -ForegroundColor Cyan

# Counter
$commitCount = 0
$fileIndex = 0

# Commit từng file
foreach ($file in $allFiles) {
    if ($commitCount -ge $commitsNeeded) {
        break
    }
    
    $relativePath = $file.Replace("$PWD\", "").Replace("\", "/")
    
    # Git add file
    git add $relativePath 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        # Kiểm tra xem có thay đổi để commit không
        $status = git status --porcelain 2>$null
        
        if ($status) {
            # Tạo commit message
            $msgPrefix = $commitMessages[$fileIndex % $commitMessages.Length]
            $fileName = Split-Path -Leaf $relativePath
            $commitMsg = "$msgPrefix $fileName"
            
            # Commit
            git commit -m $commitMsg 2>$null
            
            if ($LASTEXITCODE -eq 0) {
                $commitCount++
                $currentTotal = $currentCommits + $commitCount
                Write-Host "[$currentTotal/$targetCommits] Committed: $commitMsg" -ForegroundColor Green
            }
        }
    }
    
    $fileIndex++
}

# Nếu vẫn chưa đủ commits, tạo thêm bằng cách modify files nhỏ
if ($commitCount -lt $commitsNeeded) {
    Write-Host "`nCreating additional commits by updating files..." -ForegroundColor Yellow
    
    $remainingCommits = $commitsNeeded - $commitCount
    $filesToUpdate = $allFiles | Select-Object -First $remainingCommits
    
    foreach ($file in $filesToUpdate) {
        if ($commitCount -ge $commitsNeeded) {
            break
        }
        
        # Thêm comment vào cuối file
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Add-Content -Path $file -Value "`n// Updated: $timestamp" -Encoding UTF8
        
        $relativePath = $file.Replace("$PWD\", "").Replace("\", "/")
        
        git add $relativePath
        $fileName = Split-Path -Leaf $relativePath
        $commitMsg = "chore: Update timestamp in $fileName"
        
        git commit -m $commitMsg 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            $commitCount++
            $currentTotal = $currentCommits + $commitCount
            Write-Host "[$currentTotal/$targetCommits] Committed: $commitMsg" -ForegroundColor Green
        }
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
$finalCount = (git rev-list --count HEAD 2>$null)
Write-Host "Total commits: $finalCount" -ForegroundColor Green
Write-Host "New commits created: $commitCount" -ForegroundColor Green

if ($finalCount -ge $targetCommits) {
    Write-Host "`n🎉 Target of $targetCommits commits reached!" -ForegroundColor Green
} else {
    Write-Host "`nCurrent: $finalCount / Target: $targetCommits" -ForegroundColor Yellow
}
