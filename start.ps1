Set-Location $PSScriptRoot

$pidFile = Join-Path $PSScriptRoot ".ems-start.pids.json"
$scriptArgs = $args

function Get-FlagPresent {
	param(
		[string]$Flag
	)

	return $scriptArgs -contains $Flag
}

function Stop-EmsProcesses {
	$stoppedAny = $false

	function Stop-ProcessTree {
		param(
			[int]$ProcessId
		)

		$existing = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
		if (-not $existing) {
			return $false
		}

		$null = & taskkill /PID $ProcessId /T /F 2>$null
		Write-Host "Stopped process tree PID $ProcessId"
		return $true
	}

	if (Test-Path $pidFile) {
		try {
			$savedPids = Get-Content $pidFile -Raw | ConvertFrom-Json
			foreach ($savedPid in $savedPids) {
				if (Stop-ProcessTree -ProcessId $savedPid) {
					$stoppedAny = $true
				}
			}
		}
		catch {
			Write-Warning "Could not read PID file: $pidFile"
		}

		Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
	}

	$rootEscaped = [Regex]::Escape($PSScriptRoot)
	$patterns = @(
		"artisan serve",
		"artisan queue:work",
		"artisan schedule:work",
		"npm run dev",
		"next dev",
		"start-server.js",
		"resources/server.php",
		"127.0.0.1:8000"
	)

	$candidateProcesses = Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe' OR Name = 'pwsh.exe' OR Name = 'php.exe' OR Name = 'node.exe' OR Name = 'cmd.exe'"
	foreach ($proc in $candidateProcesses) {
		$cmd = [string]$proc.CommandLine
		if ($cmd -match $rootEscaped) {
			foreach ($pattern in $patterns) {
				if ($cmd -match [Regex]::Escape($pattern)) {
					if (Stop-ProcessTree -ProcessId $proc.ProcessId) {
						$stoppedAny = $true
					}
					break
				}
			}
		}
	}

	$listening = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in @(3000, 8000) }
	foreach ($conn in $listening) {
		$ownerProc = Get-CimInstance Win32_Process -Filter "ProcessId = $($conn.OwningProcess)" -ErrorAction SilentlyContinue
		if ($ownerProc) {
			$ownerCmd = [string]$ownerProc.CommandLine
			if ($ownerCmd -match $rootEscaped) {
				if (Stop-ProcessTree -ProcessId $conn.OwningProcess) {
					$stoppedAny = $true
				}
			}
		}
	}

	if (-not $stoppedAny) {
		Write-Host "No running EMS processes found."
	}
	else {
		Write-Host "EMS processes stopped."
	}
}

$stopRequested = (Get-FlagPresent "--stop") -or (Get-FlagPresent "-Stop") -or (Get-FlagPresent "-stop")
$startRequested = (Get-FlagPresent "--start") -or (Get-FlagPresent "-Start") -or (Get-FlagPresent "-start")

if ($stopRequested) {
	Stop-EmsProcesses
	return
}

if ((Test-Path $pidFile) -and -not $startRequested) {
	Write-Host "EMS may already be running (PID file exists). Use --stop first or --start to force a new launch."
	return
}

Write-Host "Starting backend..."
$backendProc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; php artisan serve --host=127.0.0.1 --port=8000" -PassThru

Write-Host "Starting frontend..."
$frontendProc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev" -PassThru

Write-Host "Starting queue worker..."
$queueProc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; php artisan queue:work" -PassThru

Write-Host "Starting scheduler worker..."
$schedulerProc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; php artisan schedule:work" -PassThru

@($backendProc.Id, $frontendProc.Id, $queueProc.Id, $schedulerProc.Id) | ConvertTo-Json | Set-Content -Path $pidFile -Encoding UTF8

Write-Host "Started backend, frontend, queue worker, and scheduler in separate terminals."
Write-Host "Use .\start.ps1 --stop to stop all processes started by this script."
