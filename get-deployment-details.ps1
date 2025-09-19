$headers = @{
    'Authorization' = 'Bearer yAnDFTZWIDb6fGhjwDhHkV5Z'
}

$deploymentId = "dpl_C5yQhQnjubMREZ7jggZDkfo7ixhe"

Write-Host "Getting deployment details for: $deploymentId"
Write-Host "============================================="

try {
    $response = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments/$deploymentId" -Headers $headers
    
    Write-Host "State: $($response.state)"
    Write-Host "Ready State: $($response.readyState)"
    
    if ($response.buildingAt) {
        Write-Host "Building At: $($response.buildingAt)"
    }
    
    if ($response.errorMessage) {
        Write-Host "Error Message: $($response.errorMessage)"
    }
    
    if ($response.errorStep) {
        Write-Host "Error Step: $($response.errorStep)"
    }
    
    # Try to get build logs
    Write-Host "`nTrying to get build logs..."
    $logsResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v2/deployments/$deploymentId/events?builds=1" -Headers $headers
    
    foreach ($event in $logsResponse.events) {
        if ($event.payload -and $event.payload.text) {
            Write-Host "[$($event.created)] $($event.type): $($event.payload.text)"
        }
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}
