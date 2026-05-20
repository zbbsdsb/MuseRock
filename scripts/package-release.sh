#!/bin/bash
# MuseRock Release Packager - Linux/Mac
# Creates a release ZIP package

VERSION="0.1.0"
DIST_DIR="apps/web/dist"
OUTPUT_FILE="muserock-v${VERSION}.zip"

echo "📦 MuseRock Release Packager (Linux/Mac)"
echo "========================================"
echo "Version: $VERSION"
echo "Source: $DIST_DIR"
echo "Output: $OUTPUT_FILE"
echo ""

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Error: dist directory not found!"
    echo "   Please run \"npm run build\" first."
    exit 1
fi

# Check if dist has index.html
if [ ! -f "$DIST_DIR/index.html" ]; then
    echo "❌ Error: index.html not found in dist!"
    exit 1
fi

echo "✅ dist directory verified"

# Remove existing ZIP if it exists
if [ -f "$OUTPUT_FILE" ]; then
    echo "Removing existing $OUTPUT_FILE..."
    rm -f "$OUTPUT_FILE"
fi

echo ""
echo "Creating ZIP package..."

cd "$DIST_DIR" || exit 1
zip -r "../../$OUTPUT_FILE" .
cd ../..

if [ -f "$OUTPUT_FILE" ]; then
    FILESIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo ""
    echo "✅ $OUTPUT_FILE created successfully!"
    echo "   Size: $FILESIZE"
    echo ""
    echo "🎉 Release package ready!"
    echo ""
    echo "Next steps:"
    echo "1. Test the ZIP file (extract and verify)"
    echo "2. Push to GitHub to trigger deployment"
    echo "3. Create GitHub Release and attach the ZIP"
else
    echo "❌ Error creating ZIP file"
    exit 1
fi
