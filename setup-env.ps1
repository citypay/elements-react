$ErrorActionPreference = "Stop"

$RootDir = Get-Location
$ServerEnvFile = Join-Path $RootDir "packages/demo-server/.env.local"
$ReactEnvFile = Join-Path $RootDir "packages/demo-react/.env.local"

function Prompt-Required {
    param (
        [string]$Name,
        [string]$Prompt,
        [bool]$Secret = $false,
        [string]$Current = ""
    )

    while ($true) {
        $promptText = $Prompt
        if (![string]::IsNullOrEmpty($Current)) {
            if ($Secret) {
                $currentText = Mask-Value $Current
            } else {
                $currentText = $Current
            }
            $promptText = "$Prompt [current: $currentText, press Enter to keep]"
        }

        if ($Secret) {
            $secure = Read-Host "$promptText" -AsSecureString
            $value = Convert-SecureStringToPlainText $secure
        } else {
            $value = Read-Host "$promptText"
        }

        if (![string]::IsNullOrWhiteSpace($value)) {
            return $value
        }

        if (![string]::IsNullOrEmpty($Current)) {
            return $Current
        }

        Write-Host "$Name cannot be empty." -ForegroundColor Yellow
    }
}

function Confirm-UpdateFile {
    param ([string]$FilePath)

    if (Test-Path $FilePath) {
        $response = Read-Host "$FilePath already exists. Update values? [Y/n]"
        if ($response -match '^(n|N|no|NO)$') {
            Write-Host "Skipped $FilePath"
            return $false
        }
    }

    return $true
}

function Convert-SecureStringToPlainText {
    param ([securestring]$Value)

    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

function Escape-EnvValue {
    param ([string]$Value)

    $escaped = $Value -replace '\\', '\\\\'
    $escaped = $escaped -replace '"', '\"'
    return '"' + $escaped + '"'
}

function Read-EnvValue {
    param (
        [string]$FilePath,
        [string]$Name
    )

    if (!(Test-Path $FilePath)) {
        return ""
    }

    $line = Get-Content $FilePath | Where-Object { $_ -match "^$([regex]::Escape($Name))=" } | Select-Object -Last 1
    if ([string]::IsNullOrEmpty($line)) {
        return ""
    }

    $value = $line.Substring($Name.Length + 1)
    if ($value.StartsWith('"') -and $value.EndsWith('"')) {
        $value = $value.Substring(1, $value.Length - 2)
        $value = $value -replace '\\"', '"'
        $value = $value -replace '\\\\', '\'
    }

    return $value
}

function Mask-Value {
    param ([string]$Value)

    if ([string]::IsNullOrEmpty($Value)) {
        return "<not set>"
    }

    if ($Value.Length -le 4) {
        return "****"
    }

    return $Value.Substring(0, 2) + "****" + $Value.Substring($Value.Length - 2)
}

# Validate structure
if (!(Test-Path "packages/demo-server") -or !(Test-Path "packages/demo-react")) {
    Write-Host "Error: run this script from the repository root." -ForegroundColor Red
    exit 1
}

Write-Host "CityPay demo environment setup"
Write-Host ""

# Ensure directories exist
New-Item -ItemType Directory -Force -Path (Split-Path $ServerEnvFile) | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $ReactEnvFile) | Out-Null

# Write server env
if (Confirm-UpdateFile $ServerEnvFile) {
    $currentClientId = Read-EnvValue $ServerEnvFile "EX_CP_CLIENT_ID"
    $currentLicenseKey = Read-EnvValue $ServerEnvFile "EX_CP_LICENSE_KEY"
    $currentMid = Read-EnvValue $ServerEnvFile "EX_CP_MID"

    $clientId = Prompt-Required "EX_CP_CLIENT_ID" "Client ID (e.g. PCxxxxxx)" $false $currentClientId
    $licenseKey = Prompt-Required "EX_CP_LICENSE_KEY" "Licence key" $true $currentLicenseKey
    $mid = Prompt-Required "EX_CP_MID" "Merchant ID" $false $currentMid

@"
EX_CP_CLIENT_ID=$(Escape-EnvValue $clientId)
EX_CP_LICENSE_KEY=$(Escape-EnvValue $licenseKey)
EX_CP_MID=$(Escape-EnvValue $mid)
"@ | Set-Content -Path $ServerEnvFile -Encoding UTF8

    Write-Host "Wrote $ServerEnvFile"
}

# Write react env
if (Confirm-UpdateFile $ReactEnvFile) {
    $currentPublicKey = Read-EnvValue $ReactEnvFile "VITE_EX_CP_PUBLIC_KEY"
    if ([string]::IsNullOrEmpty($currentPublicKey)) {
        $currentPublicKey = Read-EnvValue $ReactEnvFile "NEXT_PUBLIC_EX_CP_PUBLIC_KEY"
    }

    $publicKey = Prompt-Required "VITE_EX_CP_PUBLIC_KEY" "Public key (e.g. pk_xxx)" $false $currentPublicKey

@"
VITE_EX_CP_PUBLIC_KEY=$(Escape-EnvValue $publicKey)
"@ | Set-Content -Path $ReactEnvFile -Encoding UTF8

    Write-Host "Wrote $ReactEnvFile"
}

Write-Host ""
Write-Host "Done."
