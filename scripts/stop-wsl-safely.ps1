# Run from Windows PowerShell. -WhatIf prints the action without stopping anything.
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [ValidateSet('Prepare', 'Wsl', 'RestartPC', 'ShutdownPC')]
    [string]$Action = 'Prepare',
    [ValidatePattern('^[a-zA-Z0-9_.-]+$')]
    [string]$Distribution = 'Ubuntu',
    [string]$Repository = '/home/pyu/docker'
)

$ErrorActionPreference = 'Stop'
$wsl = Join-Path $env:SystemRoot 'System32\wsl.exe'
$shutdown = Join-Path $env:SystemRoot 'System32\shutdown.exe'

if (-not $PSCmdlet.ShouldProcess($Distribution, "Stop Docker safely, then $Action")) {
    return
}

& $wsl --distribution $Distribution --user root --exec bash "$Repository/scripts/prepare-wsl-shutdown.sh"
if ($LASTEXITCODE -ne 0) {
    throw 'Docker did not stop cleanly. WSL/Windows shutdown cancelled.'
}

if ($Action -eq 'Prepare') {
    Write-Output 'Docker stopped. To resume: sudo systemctl start containerd docker.socket docker'
    return
}

& $wsl --terminate $Distribution
if ($LASTEXITCODE -ne 0) {
    throw 'WSL termination failed. Windows shutdown cancelled.'
}

switch ($Action) {
    'RestartPC' { & $shutdown /r /t 0 }
    'ShutdownPC' { & $shutdown /s /t 0 }
}
if ($LASTEXITCODE -ne 0) {
    throw 'The requested shutdown action failed.'
}
