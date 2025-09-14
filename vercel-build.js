const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build process...');
console.log('Current working directory:', process.cwd());
console.log('Directory contents:', fs.readdirSync('.').join(', '));

// Ensure the dist directory exists
const distDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy all non-TypeScript files to dist
console.log('Copying non-TypeScript files...');
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      if (childItemName !== 'node_modules' && childItemName !== 'dist') {
        copyRecursiveSync(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        );
      }
    });
  } else if (src.endsWith('.json') || !src.endsWith('.ts')) {
    fs.copyFileSync(src, dest);
  }
}

// Copy all necessary files to dist
copyRecursiveSync(path.join(process.cwd(), 'src'), path.join(distDir, 'src'));

// Verify tsconfig.json exists
const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
if (!fs.existsSync(tsConfigPath)) {
  console.error('Error: tsconfig.json not found at', tsConfigPath);
  process.exit(1);
}

// Run TypeScript compiler
console.log('Running TypeScript compiler...');
try {
  execSync('npx tsc -p tsconfig.json --outDir dist --noEmit false', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('TypeScript compilation completed successfully');
} catch (error) {
  console.error('TypeScript compilation failed:', error);
  process.exit(1);
}

// Run tsc-alias to resolve path aliases
console.log('Resolving path aliases...');
try {
  execSync('npx tsc-alias -p tsconfig.json', { 
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('Path aliases resolved successfully');
} catch (error) {
  console.error('Failed to resolve path aliases:', error);
  process.exit(1);
}

// Verify the output
console.log('Build completed successfully!');
console.log('Dist directory contents:', fs.readdirSync(distDir).join(', '));

// Verify the user entity is in the right place
const userEntityPath = path.join(distDir, 'src/entities/user.js');
if (!fs.existsSync(userEntityPath)) {
  console.error('Error: User entity not found at', userEntityPath);
  console.log('Trying to find user entity...');
  const find = require('find');
  const files = find.fileSync(/\.(js|ts)$/, path.join(distDir, 'src'));
  console.log('Found files:', files);
  process.exit(1);
} else {
  console.log('User entity found at:', userEntityPath);
}
