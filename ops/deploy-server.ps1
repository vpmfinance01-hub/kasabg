# Качва сглобеното приложение на сървъра и го пресъздава. Изисква SSH достъп с ключ.
# Употреба: .\ops\deploy-server.ps1 -HostName root@СЪРВЪР -Key C:\път\до\ключа
param([Parameter(Mandatory)] [string] $HostName, [Parameter(Mandatory)] [string] $Key)
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
npm run build
if (-not (Test-Path ".next\standalone\server.js")) { throw "Сборката не успя" }
$stage = Join-Path $env:TEMP "kasabg-stage"
Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $stage | Out-Null
Copy-Item -Recurse ".next\standalone\*" $stage
New-Item -ItemType Directory -Force "$stage\.next\static" | Out-Null
Copy-Item -Recurse ".next\static\*" "$stage\.next\static"
Copy-Item -Recurse "public" "$stage\public"
Get-ChildItem $stage -Recurse -Force -Filter ".env*" | Remove-Item -Force   # без тайни в пакета
$tar = Join-Path $env:TEMP "kasabg-app.tar.gz"
tar -C $stage -czf $tar .
scp -i $Key $tar "${HostName}:/opt/kasabg/app.tar.gz"
ssh -i $Key $HostName "cd /opt/kasabg && rm -rf app && mkdir app && tar -xzf app.tar.gz -C app && rm app.tar.gz && docker compose up -d --force-recreate app"
