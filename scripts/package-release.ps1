# MuseRock Release Packager - Windows PowerShell
# Creates a release ZIP package

$VERSION = "0.1.0"
$DIST_DIR = "apps\web\dist"
$OUTPUT_FILE = "muserock-v$VERSION.zip"

Write-Host "📦 MuseRock Release Packager (Windows)" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host "Version: $VERSION"
Write-Host "Source: $DIST_DIR"
Write-Host "Output: $OUTPUT_FILE"
Write-Host ""

# Check if dist directory exists
if (-not (Test-Path $DIST_DIR)) {
    Write-Host "❌ Error: dist directory not found!" -ForegroundColor Red
    Write-Host "   Please run `"npm run build`" first." -ForegroundColor Yellow
    exit 1
}

# Check if dist has index.html
if (-not (Test-Path "$DIST_DIR\index.html")) {
    Write-Host "❌ Error: index.html not found in dist!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ dist directory verified" -ForegroundColor Green

# Remove existing ZIP if it exists
if (Test-Path $OUTPUT_FILE) {
    Write-Host "Removing existing $OUTPUT_FILE..." -ForegroundColor Yellow
    Remove-Item $OUTPUT_FILE -Force
}

Write-Host ""
Write-Host "Creating ZIP package..." -ForegroundColor Cyan

# Create the ZIP
try {
    Compress-Archive -Path "$DIST_DIR\*" -DestinationPath $OUTPUT_FILE -Force
    Write-Host "✅ $OUTPUT_FILE created successfully!" -ForegroundColor Green
    
    $fileSize = (Get-Item $OUTPUT_FILE).Length
    $sizeMB = [math]::Round($fileSize / 1MB, 2)
    Write-Host "   Size: $sizeMB MB" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "🎉 Release package ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Test the ZIP file (extract and verify)"
    Write-Host "2. Push to GitHub to trigger deployment"
    Write-Host "3. Create GitHub Release and attach the ZIP"
} catch {
    Write-Host "❌ Error creating ZIP: $_" -ForegroundColor Red
    exit 1
}
