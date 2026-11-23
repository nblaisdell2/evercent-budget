# Generate the Railway domain, or attach a custom domain (PowerShell).
#   npm run railway:domain                          -> generated *.up.railway.app domain
#   npm run railway:domain -- app.example.com       -> custom domain
#   npm run railway:domain -- dev.example.com -Environment dev
#                                                   -> custom domain for the dev environment
#
# Without -Environment it acts on the linked environment (production) and
# records CUSTOM_DOMAIN; with -Environment dev it acts on dev and records
# DEV_DOMAIN instead.
#
# Custom domain: attaches it with `railway domain <domain>` (Railway's IaC can't
# register custom domains), records it as CUSTOM_DOMAIN in .railway/railway.ts,
# and prints the DNS records to add at your DNS provider: a CNAME (where
# traffic goes) AND a TXT (proves you own the domain; without it Railway
# answers 404). Railway issues the Let's Encrypt certificate automatically once
# DNS has propagated.

[CmdletBinding()]
param(
    [Parameter(Position = 0)][string]$Domain,
    [ValidateSet("dev")][string]$Environment
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib/common.ps1")
Set-Location $Root

$ConstName = "CUSTOM_DOMAIN"
if ($Environment) {
    $RailwayEnvArgs = @("--environment", $Environment)
    $ConstName = "DEV_DOMAIN"
    Write-Host "Environment: $Environment" -ForegroundColor Cyan
}

if (-not $Domain) {
    $total = 2
    Write-Step 1 $total "Checking Railway CLI + linked project"
    Assert-RailwayCli; Assert-RailwayLogin; Assert-RailwayLinked

    Write-Step 2 $total "Railway-provided domain for '$WebService'"
    $existing = Get-RailwayDomain
    if ($existing) {
        Write-Host "Already has one: https://$existing" -ForegroundColor Green
        exit 0
    }
    railway domain --service $WebService @RailwayEnvArgs
    if ($LASTEXITCODE -ne 0) { throw "railway domain failed" }
    $d = Get-RailwayDomain
    if ($d) { Write-Host "`nLive at:  https://$d" -ForegroundColor Green }
    exit 0
}

$Domain = $Domain.Trim().ToLower() -replace '^https?://', '' -replace '/.*$', ''
if ($Domain -notmatch '^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$') {
    throw "'$Domain' doesn't look like a hostname (e.g. app.example.com)."
}
$total = 3

Write-Step 1 $total "Checking Railway CLI + linked project"
Assert-RailwayCli; Assert-RailwayLogin; Assert-RailwayLinked

Write-Step 2 $total "Attaching $Domain to '$WebService'"
Add-RailwayCustomDomain $Domain

Write-Step 3 $total "Recording $ConstName in .railway/railway.ts"
$previous = Get-RailwayConst $ConstName
if ($previous -eq $Domain) {
    Write-Host "Already recorded."
} else {
    Set-RailwayConst $ConstName $Domain
    Write-Host "$ConstName = `"$Domain`". Commit .railway/railway.ts so it stays recorded."
    if ($previous) {
        Write-Host "The previous domain '$previous' is still attached. To remove it:" -ForegroundColor Yellow
        Write-Host "  railway domain delete $previous --service $WebService $($RailwayEnvArgs -join ' ') --yes"
    }
}
