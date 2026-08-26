<#
.SYNOPSIS
  Upload the local AI Hub dataset (S:\AudioData) to Google Drive via rclone.

.DESCRIPTION
  1. Ensures rclone is installed (installs via winget if missing).
  2. Verifies a Google Drive remote of the given name is already configured
     (rclone's OAuth login is interactive, so `rclone config` must be run by
     hand once beforehand — this script won't do it for you).
  3. Runs a parallel `rclone copy` tuned for a few large files rather than
     many small ones (bump --drive-chunk-size, not just --transfers).
  4. Verifies the upload by comparing local vs remote size/file count.

.PARAMETER RemoteName
  Name of the rclone remote to use, WITHOUT the trailing colon (e.g. "gdrive").
  Must already exist in `rclone listremotes` — run `rclone config` first if not.

.PARAMETER DriveFolder
  Destination folder path inside that Drive remote.

.PARAMETER LocalPath
  Local source folder to upload.

.PARAMETER Transfers
  Number of files to upload concurrently. Default 7 matches the current
  7-zip-file layout under S:\AudioData; raise it only if the source ever
  has more top-level files.

.PARAMETER ChunkSizeMB
  Per-file upload chunk size in MB (rclone --drive-chunk-size). Larger chunks
  cut HTTP overhead for big files at the cost of more RAM per transfer
  (RAM used ~= Transfers * ChunkSizeMB).

.PARAMETER FullCheck
  If set, runs `rclone check` after the copy for a full checksum comparison
  (re-reads all data on both sides — slow for 95GB, but the only way to be
  sure nothing got corrupted in transit). Default is a cheap size/count check.

.EXAMPLE
  .\upload_to_gdrive.ps1 -RemoteName gdrive -DriveFolder "AI_Hub_Data"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$RemoteName,

    [Parameter(Mandatory = $true)]
    [string]$DriveFolder,

    [string]$LocalPath = "S:\AudioData",

    [int]$Transfers = 7,

    [int]$ChunkSizeMB = 64,

    [switch]$FullCheck
)

$ErrorActionPreference = "Stop"

function Assert-RcloneInstalled {
    $rclone = Get-Command rclone -ErrorAction SilentlyContinue
    if ($rclone) {
        Write-Host "rclone found: $($rclone.Source)" -ForegroundColor Green
        return
    }

    Write-Host "rclone not found. Attempting install via winget..." -ForegroundColor Yellow
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if (-not $winget) {
        throw "winget is not available either. Install rclone manually from https://rclone.org/downloads/ and re-run this script."
    }

    winget install --id Rclone.Rclone -e --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -ne 0) {
        throw "winget install of rclone failed (exit $LASTEXITCODE). Install manually from https://rclone.org/downloads/."
    }

    # winget installs may need a fresh PATH read in this session
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

    if (-not (Get-Command rclone -ErrorAction SilentlyContinue)) {
        throw "rclone installed but not found on PATH in this session. Open a new terminal and re-run this script."
    }
    Write-Host "rclone installed." -ForegroundColor Green
}

function Assert-RemoteConfigured {
    param([string]$Name)

    $remotes = & rclone listremotes 2>$null
    $target = "${Name}:"
    if ($remotes -notcontains $target) {
        Write-Host "No rclone remote named '$Name' found. Configured remotes:" -ForegroundColor Red
        if ($remotes) { $remotes | ForEach-Object { Write-Host "  $_" } } else { Write-Host "  (none)" }
        Write-Host ""
        Write-Host "Run 'rclone config' once, interactively, to create it (Google Drive OAuth needs a browser login you must do yourself — pick the correct paid Google account when the consent screen appears)." -ForegroundColor Yellow
        throw "Remote '$Name' is not configured."
    }

    $type = & rclone config show $Name 2>$null | Select-String "^type\s*=\s*drive"
    if (-not $type) {
        Write-Host "Remote '$Name' exists but does not look like a Google Drive remote (rclone config show $Name):" -ForegroundColor Red
        & rclone config show $Name
        throw "Remote '$Name' is not type=drive."
    }

    Write-Host "Remote '$Name' confirmed as a Google Drive remote." -ForegroundColor Green
}

function Assert-LocalPathExists {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Local path not found: $Path"
    }
}

# --- 1. sanity checks -------------------------------------------------
Assert-RcloneInstalled
Assert-RemoteConfigured -Name $RemoteName
Assert-LocalPathExists -Path $LocalPath

$dest = "${RemoteName}:${DriveFolder}"

Write-Host ""
Write-Host "Local : $LocalPath"
Write-Host "Remote: $dest"
Write-Host "Transfers=$Transfers  ChunkSize=${ChunkSizeMB}M"
Write-Host ""

# --- 2. parallel upload -------------------------------------------------
# --retries / --low-level-retries: auto-retry on transient network errors
# --drive-chunk-size: bigger chunks matter more than --transfers here since
#   the source is a handful of large zip files, not many small ones
rclone copy $LocalPath $dest `
    --transfers $Transfers `
    --checkers 16 `
    --drive-chunk-size "${ChunkSizeMB}M" `
    --retries 5 `
    --low-level-retries 10 `
    -P

if ($LASTEXITCODE -ne 0) {
    throw "rclone copy failed with exit code $LASTEXITCODE"
}

# --- 3. verification -------------------------------------------------
Write-Host ""
Write-Host "=== Verifying upload ===" -ForegroundColor Cyan

Write-Host "-- Local size --"
rclone size $LocalPath

Write-Host "-- Remote size --"
rclone size $dest

if ($FullCheck) {
    Write-Host "-- Full checksum check (this re-reads all data, can take a while) --"
    rclone check $LocalPath $dest --one-way
    if ($LASTEXITCODE -ne 0) {
        throw "rclone check reported mismatches — see output above."
    }
    Write-Host "Checksum check passed." -ForegroundColor Green
} else {
    Write-Host "Skipped full checksum check (pass -FullCheck to run it)." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "-- Remote file listing --"
rclone ls $dest

Write-Host ""
Write-Host "Done." -ForegroundColor Green
