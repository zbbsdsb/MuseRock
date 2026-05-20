import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION = '0.1.0';
const DIST_DIR = path.join(__dirname, '..', 'apps', 'web', 'dist');
const OUTPUT_FILE = path.join(__dirname, '..', `muserock-v${VERSION}.zip`);

console.log('📦 MuseRock Release Packager');
console.log('============================');
console.log(`Version: ${VERSION}`);
console.log(`Source: ${DIST_DIR}`);
console.log(`Output: ${OUTPUT_FILE}`);
console.log();

// Check if dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Error: dist directory not found!');
  console.error('   Please run "npm run build" first.');
  process.exit(1);
}

// Check if dist has required files
const requiredFiles = ['index.html', 'assets'];
const missingFiles = requiredFiles.filter(f => !fs.existsSync(path.join(DIST_DIR, f)));
if (missingFiles.length > 0) {
  console.error('❌ Error: Missing required files in dist:');
  missingFiles.forEach(f => console.error(`   - ${f}`));
  process.exit(1);
}

console.log('✅ dist directory verified');

// Check for docs and logo (optional but recommended)
const hasDocs = fs.existsSync(path.join(DIST_DIR, 'docs'));
const hasLogo = fs.existsSync(path.join(DIST_DIR, 'logo.png'));

if (!hasDocs) {
  console.warn('⚠️  Warning: docs/ not found in dist');
}
if (!hasLogo) {
  console.warn('⚠️  Warning: logo.png not found in dist');
}

console.log();
console.log('📋 Contents to package:');
const items = fs.readdirSync(DIST_DIR);
items.forEach(item => {
  const itemPath = path.join(DIST_DIR, item);
  const stats = fs.statSync(itemPath);
  const size = stats.isDirectory() ? '(dir)' : formatBytes(stats.size);
  console.log(`   ${item} ${size}`);
});

console.log();
console.log('✅ Pre-flight checks passed!');
console.log();
console.log('To create the actual ZIP file, use:');
console.log();
console.log('Windows (PowerShell):');
console.log(`  Compress-Archive -Path "${DIST_DIR}\\*" -DestinationPath "${OUTPUT_FILE}" -Force`);
console.log();
console.log('Linux/Mac:');
console.log(`  cd "${DIST_DIR}" && zip -r "${OUTPUT_FILE}" .`);
console.log();
console.log('Or use the platform-specific scripts in scripts/');
console.log();

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
