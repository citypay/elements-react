$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path "$ScriptDir\.."
$CertsDir = Join-Path $RootDir "certs"

$CertFile = Join-Path $CertsDir "localhost.pem"
$KeyFile  = Join-Path $CertsDir "localhost-key.pem"

function Test-Mkcert {
    return Get-Command mkcert -ErrorAction SilentlyContinue
}

if (-not (Test-Mkcert)) {
    Write-Error "mkcert is not installed or not on PATH.`n"
    Write-Host "Install mkcert, then re-run this script."
    Write-Host ""
    Write-Host "Common install options:"
    Write-Host "  choco install mkcert"
    Write-Host "  scoop install mkcert"
    exit 1
}

if (-not (Test-Path $CertsDir)) {
    New-Item -ItemType Directory -Path $CertsDir | Out-Null
}

Write-Host "Installing mkcert local CA (if not already installed)..."
mkcert -install

$TempDir = New-Item -ItemType Directory -Path ([System.IO.Path]::GetTempPath()) -Name ("mkcert-" + [System.Guid]::NewGuid())

try {
    Push-Location $TempDir.FullName

    Write-Host "Generating localhost certificate..."
    mkcert `
        -cert-file localhost.pem `
        -key-file localhost-key.pem `
        localhost 127.0.0.1 ::1

    Pop-Location

    Move-Item "$($TempDir.FullName)\localhost.pem" $CertFile -Force
    Move-Item "$($TempDir.FullName)\localhost-key.pem" $KeyFile -Force

    Write-Host ""
    Write-Host "Done."
    Write-Host "Certificate: $CertFile"
    Write-Host "Key:         $KeyFile"
}
finally {
    Remove-Item $TempDir.FullName -Recurse -Force -ErrorAction SilentlyContinue
}