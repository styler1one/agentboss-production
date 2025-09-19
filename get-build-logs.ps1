$headers = @{
    'Authorization' = 'Bearer yAnDFTZWIDb6fGhjwDhHkV5Z'
}

# Get the latest deployment
$deploymentId = "dpl_C5yQhQnjubMREZ7jggZDkfo7ixhe"

Write-Host "Getting build logs for deployment: $deploymentId"
Write-Host "=================================="

try {
    $response = Invoke-RestMethod -Uri "https://api.vercel.com/v2/deployments/$deploymentId/events" -Headers $headers
    
    foreach ($event in $response.events) {
        if ($event.type -eq "command" -or $event.type -eq "stderr" -or $event.type -eq "stdout") {
            Write-Host "[$($event.created)] $($event.type): $($event.payload.text)"
        }
    }
} catch {
    Write-Host "Error getting logs: $($_.Exception.Message)"
}
