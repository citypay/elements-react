$ErrorActionPreference = "Stop"

$RootDir = Get-Location
$ServerEnvFile = Join-Path $RootDir "packages/demo-server/.env.local"
$ReactEnvFile = Join-Path $RootDir "packages/demo-react/.env.local"

function Prompt-Required {
    param (
        [string]$Name,
        [string]$Prompt,
        [bool]$Secret = $false
    )

    while ($true) {
        if ($Secret) {
            $secure = Read-Host "$Prompt" -AsSecureString
            $value = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
            )
        } else {
            $value = Read-Host "$Prompt"
        }

        if (![string]::IsNullOrWhiteSpace($value)) {
            return $value
        }

        Write-Host "$Name cannot be empty." -ForegroundColor Yellow
    }
}

function Confirm-Overwrite {
    param ([string]$FilePath)

    if (Test-Path $FilePath) {
        $response = Read-Host "$FilePath already exists. Overwrite? [y/N]"
        if ($response -notmatch '^(y|Y|yes|YES)$') {
            Write-Host "Skipped $FilePath"
            return $false
        }
    }

    return $true
}

function Escape-EnvValue {
    param ([string]$Value)

    $escaped = $Value -replace '\\', '\\\\'
    $escaped = $escaped -replace '"', '\"'
    return '"' + $escaped + '"'
}

# Validate structure
if (!(Test-Path "packages/demo-server") -or !(Test-Path "packages/demo-react")) {
    Write-Host "Error: run this script from the repository root." -ForegroundColor Red
    exit 1
}

Write-Host "CityPay demo environment setup"
Write-Host ""

# Prompt user
$clientId = Prompt-Required "EX_CP_CLIENT_ID" "Client ID (e.g. PCxxxxxx)"
$licenseKey = Prompt-Required "EX_CP_LICENSE_KEY" "License key" $true
$mid = Prompt-Required "EX_CP_MID" "Merchant ID"
$publicKey = Prompt-Required "NEXT_PUBLIC_EX_CP_PUBLIC_KEY" "Public key (e.g. pk_xxx)"

# Ensure directories exist
New-Item -ItemType Directory -Force -Path (Split-Path $ServerEnvFile) | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $ReactEnvFile) | Out-Null

# Write server env
if (Confirm-Overwrite $ServerEnvFile) {
@"
EX_CP_CLIENT_ID=$(Escape-EnvValue $clientId)
EX_CP_LICENSE_KEY=$(Escape-EnvValue $licenseKey)
EX_CP_MID=$(Escape-EnvValue $mid)
"@ | Set-Content -Path $ServerEnvFile -Encoding UTF8

    Write-Host "Wrote $ServerEnvFile"
}

# Write react env
if (Confirm-Overwrite $ReactEnvFile) {
@"
NEXT_PUBLIC_EX_CP_PUBLIC_KEY=$(Escape-EnvValue $publicKey)
"@ | Set-Content -Path $ReactEnvFile -Encoding UTF8

    Write-Host "Wrote $ReactEnvFile"
}

Write-Host ""
Write-Host "Done."