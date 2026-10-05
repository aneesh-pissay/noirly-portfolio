const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync('.next/standalone')) {
  console.log('No standalone output; skipping static asset copy.');
  process.exit(0);
}

console.log('Copying static assets to standalone build...');
copyRecursive('.next/static', '.next/standalone/.next/static');
copyRecursive('public', '.next/standalone/public');
console.log('✓ Static assets copied successfully');

// server.js chdirs into .next/standalone, so runtime env files must live there.
for (const envFile of ['.env', '.env.production', '.env.local', '.env.production.local']) {
  if (fs.existsSync(envFile)) {
    fs.copyFileSync(envFile, path.join('.next/standalone', envFile));
    console.log(`✓ Copied ${envFile} to standalone build`);
  }
}
