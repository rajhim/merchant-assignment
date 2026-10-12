const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

console.log('\x1b[36m%s\x1b[0m', '=== Starting Merchant Portal Development Environment ===');

if (!fs.existsSync(path.join(serverDir, 'node_modules'))) {
  console.log('\x1b[33m%s\x1b[0m', 'Installing server dependencies...');
  execSync(`${npmCmd} install`, { cwd: serverDir, stdio: 'inherit' });
}

console.log('\x1b[33m%s\x1b[0m', 'Building backend API server...');
execSync(`${npmCmd} run build`, { cwd: serverDir, stdio: 'inherit' });

console.log('\x1b[32m%s\x1b[0m', 'Starting NestJS Backend API (Port 3000)...');
const apiProcess = spawn('node', ['dist/main.js'], {
  cwd: serverDir,
  env: { ...process.env, PORT: '3000' },
  shell: true
});

apiProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[API]\x1b[0m ${data}`);
});

apiProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[API ERR]\x1b[0m ${data}`);
});

console.log('\x1b[32m%s\x1b[0m', 'Starting Angular Client (Port 4200)...');
const clientProcess = spawn(npxCmd, ['ng', 'serve'], {
  cwd: rootDir,
  env: process.env,
  shell: true
});

clientProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[35m[UI]\x1b[0m ${data}`);
});

clientProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[UI LOG]\x1b[0m ${data}`);
});

function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down servers...');
  if (isWindows) {
    if (apiProcess.pid) {
      try { execSync(`taskkill /pid ${apiProcess.pid} /T /F`, { stdio: 'ignore' }); } catch (e) {}
    }
    if (clientProcess.pid) {
      try { execSync(`taskkill /pid ${clientProcess.pid} /T /F`, { stdio: 'ignore' }); } catch (e) {}
    }
  } else {
    apiProcess.kill('SIGTERM');
    clientProcess.kill('SIGTERM');
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
