const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * MEDWEG Development Server Stopper
 * Zaustavlja backend i frontend servere i oslobađa portove 5000 i 3000
 */

console.log('🛑 MEDWEG - Zaustavljanje development servera...\n');

const isWindows = process.platform === 'win32';

/**
 * Kill process on specific port (Windows)
 */
async function killPortWindows(port) {
  try {
    // Find PID using port
    const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
    const lines = stdout.trim().split('\n');

    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        pids.add(pid);
      }
    }

    if (pids.size === 0) {
      console.log(`✓ Port ${port} je već slobodan`);
      return;
    }

    // Kill all PIDs
    for (const pid of pids) {
      try {
        await execPromise(`taskkill /PID ${pid} /F`);
        console.log(`✓ Zaustavljen proces na portu ${port} (PID: ${pid})`);
      } catch (err) {
        // Process might already be dead
      }
    }
  } catch (error) {
    console.log(`✓ Port ${port} je slobodan`);
  }
}

/**
 * Kill process on specific port (Unix/Linux/Mac)
 */
async function killPortUnix(port) {
  try {
    const { stdout } = await execPromise(`lsof -ti:${port}`);
    const pids = stdout.trim().split('\n').filter(Boolean);

    if (pids.length === 0) {
      console.log(`✓ Port ${port} je već slobodan`);
      return;
    }

    for (const pid of pids) {
      try {
        await execPromise(`kill -9 ${pid}`);
        console.log(`✓ Zaustavljen proces na portu ${port} (PID: ${pid})`);
      } catch (err) {
        // Process might already be dead
      }
    }
  } catch (error) {
    console.log(`✓ Port ${port} je slobodan`);
  }
}

/**
 * Main function
 */
async function stopServers() {
  try {
    console.log('Zaustavljam backend server (port 5000)...');
    if (isWindows) {
      await killPortWindows(5000);
    } else {
      await killPortUnix(5000);
    }

    console.log('\nČistim port 8080 (stari backend port)...');
    if (isWindows) {
      await killPortWindows(8080);
    } else {
      await killPortUnix(8080);
    }

    console.log('\nZaustavljam frontend server (port 3000)...');
    if (isWindows) {
      await killPortWindows(3000);
    } else {
      await killPortUnix(3000);
    }

    console.log('\n✅ Svi serveri su zaustavljeni!\n');
  } catch (error) {
    console.error('❌ Greška pri zaustavljanju servera:', error.message);
    process.exit(1);
  }
}

// Run
stopServers();
