$headers = @{
    'Authorization' = 'Bearer yAnDFTZWIDb6fGhjwDhHkV5Z'
}

$response = Invoke-RestMethod -Uri 'https://api.vercel.com/v6/deployments?limit=3' -Headers $headers

foreach ($deployment in $response.deployments) {
    Write-Host "Deployment: $($deployment.uid)"
    Write-Host "Name: $($deployment.name)"
    Write-Host "State: $($deployment.state)"
    Write-Host "Created: $($deployment.createdAt)"
    Write-Host "URL: $($deployment.url)"
    Write-Host "---"
}
