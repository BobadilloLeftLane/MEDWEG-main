const { spawn } = require('child_process');
const path = require('path');

/**
 * MEDWEG Development Server Starter
 * Pokreće backend (port 5000) i frontend (port 3000) istovremeno
 */

console.log('🚀 MEDWEG - Pokretanje development servera...\n');

const isWindows = process.platform === 'win32';
const rootDir = path.join(__dirname, '..');

// Backend process
const backendDir = path.join(rootDir, 'backend');
const backendCmd = isWindows ? 'npm.cmd' : 'npm';
const backend = spawn(backendCmd, ['run', 'dev'], {
  cwd: backendDir,
  shell: true,
  stdio: 'inherit',
});

// Frontend process
const frontendDir = path.join(rootDir, 'frontend');
const frontendCmd = isWindows ? 'npm.cmd' : 'npm';
const frontend = spawn(frontendCmd, ['run', 'dev'], {
  cwd: frontendDir,
  shell: true,
  stdio: 'inherit',
});

// Handle backend exit
backend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\n❌ Backend process exited with code ${code}`);
  }
});

// Handle frontend exit
frontend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\n❌ Frontend process exited with code ${code}`);
  }
});

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Zaustavljam development servere...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});

console.log('✅ Backend server: http://localhost:5000');
console.log('✅ Frontend server: http://localhost:3000');
console.log('\n💡 Pritisnite Ctrl+C da zaustavite servere\n');
