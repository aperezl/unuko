import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(cliRoot, '../..');

function main() {
  console.log('📦 Copying build assets into CLI package...');

  const assetsDir = path.join(cliRoot, 'assets');
  if (fs.existsSync(assetsDir)) {
    fs.rmSync(assetsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(assetsDir, { recursive: true });

  // 1. Copy backend build
  console.log(' - Copying backend...');
  fs.cpSync(
    path.join(repoRoot, 'apps/sim-backend/dist'),
    path.join(assetsDir, 'sim-backend/dist'),
    { recursive: true }
  );
  fs.cpSync(
    path.join(repoRoot, 'apps/sim-backend/package.json'),
    path.join(assetsDir, 'sim-backend/package.json')
  );

  // 2. Copy SM-DP+ Mock v2 build
  console.log(' - Copying SM-DP+ mock v2...');
  fs.cpSync(
    path.join(repoRoot, 'apps/smdp-mockv2/dist'),
    path.join(assetsDir, 'smdp-mockv2/dist'),
    { recursive: true }
  );
  fs.cpSync(
    path.join(repoRoot, 'apps/smdp-mockv2/package.json'),
    path.join(assetsDir, 'smdp-mockv2/package.json')
  );

  // 3. Copy Frontend static build
  console.log(' - Copying frontend static build...');
  fs.cpSync(
    path.join(repoRoot, 'apps/sim-frontend/dist'),
    path.join(assetsDir, 'sim-frontend/dist'),
    { recursive: true }
  );

  // 4. Copy lima.yaml definition to package root
  console.log(' - Copying lima.yaml...');
  fs.cpSync(
    path.join(repoRoot, 'lima.yaml'),
    path.join(cliRoot, 'lima.yaml')
  );

  console.log('✨ All assets bundled successfully!');
}

main();
