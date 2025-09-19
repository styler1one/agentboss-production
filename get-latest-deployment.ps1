$headers = @{
    'Authorization' = 'Bearer yAnDFTZWIDb6fGhjwDhHkV5Z'
}

$deploymentId = "dpl_AL66HpAaxzXCpQiVarHxU2c8NmLh"

Write-Host "Getting latest deployment details: $deploymentId"
Write-Host "================================================"

try {
    $response = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments/$deploymentId" -Headers $headers
    
    Write-Host "State: $($response.state)"
    Write-Host "Ready State: $($response.readyState)"
    
    if ($response.errorMessage) {
        Write-Host "Error Message: $($response.errorMessage)"
    }
    
    if ($response.errorStep) {
        Write-Host "Error Step: $($response.errorStep)"
    }
    
    # Get build logs
    Write-Host "`nBuild Logs:"
    Write-Host "==========="
    $logsResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v2/deployments/$deploymentId/events?builds=1" -Headers $headers
    
    foreach ($event in $logsResponse.events) {
        if ($event.payload -and $event.payload.text) {
            $text = $event.payload.text
            if ($text -match "error|Error|ERROR|failed|Failed|FAILED") {
                Write-Host "[ERROR] [$($event.created)] $($event.type): $text"
            } elseif ($text -match "warning|Warning|WARNING") {
                Write-Host "[WARNING] [$($event.created)] $($event.type): $text"
            } else {
                Write-Host "[$($event.created)] $($event.type): $text"
            }
        }
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
