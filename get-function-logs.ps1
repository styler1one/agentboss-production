$headers = @{
    'Authorization' = 'Bearer yAnDFTZWIDb6fGhjwDhHkV5Z'
}

$deploymentId = "dpl_8bjqfEvbgZakknAFJK6jscmB177R"

Write-Host "Getting function logs for deployment: $deploymentId"
Write-Host "================================================"

try {
    # Get deployment details first
    $deployment = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments/$deploymentId" -Headers $headers
    
    Write-Host "Deployment URL: $($deployment.url)"
    Write-Host "State: $($deployment.state)"
    
    # Get function logs
    $logsResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v2/deployments/$deploymentId/events?builds=1&limit=50" -Headers $headers
    
    Write-Host "`nRecent Events:"
    Write-Host "=============="
    
    foreach ($logEvent in $logsResponse.events) {
        if ($logEvent.payload -and $logEvent.payload.text) {
            $text = $logEvent.payload.text
            $timestamp = [DateTimeOffset]::FromUnixTimeMilliseconds($logEvent.created).ToString("HH:mm:ss")
            
            if ($text -match "error|Error|ERROR|failed|Failed|FAILED") {
                Write-Host "[$timestamp] ERROR: $text" -ForegroundColor Red
            } elseif ($text -match "warning|Warning|WARNING") {
                Write-Host "[$timestamp] WARN: $text" -ForegroundColor Yellow
            } else {
                Write-Host "[$timestamp] INFO: $text"
            }
        }
    }
    
} catch {
    Write-Host "Error getting logs: $($_.Exception.Message)"
}
