const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'y.m.b_assiten',
  version: false,  // auto detect
  auth: 'offline',
  connectTimeout: 30000,  // 🔥 30s timeout
  requestTimeout: 30000
};

let retryDelay = 20000;  // 🔥 Naikkan initial delay
const MAX_DELAY = 120000; // 2 menit max
let consecutiveFails = 0;
const MAX_CONSECUTIVE_FAILS = 5;
let isStopping = false;
let currentBot = null;  // 🔥 Track bot instance

process.on('uncaughtException', err => {
  console.log('💥 UNCAUGHT:', err.message);
});
process.on('unhandledRejection', err => {
  console.log('💥 UNHANDLED:', err.message);
});

// ================= START =================
function start() {
  if (isStopping) {
    console.log('🛑 STOPPED');
    return;
  }
  
  console.log(`⏳ Wait ${Math.round(retryDelay/1000)}s... [Fails: ${consecutiveFails}/${MAX_CONSECUTIVE_FAILS}]`);

  setTimeout(() => {
    createBot();
  }, retryDelay);
}

// ================= CREATE BOT =================
function createBot() {
  console.log('🔌 Connecting to', CONFIG.host, ':', CONFIG.port);
  
  // Kill previous bot if exists
  if (currentBot) {
    try {
      currentBot.end();
    } catch (e) {}
    currentBot = null;
  }

  currentBot = mineflayer.createBot(CONFIG);

  currentBot.once('login', () => {
    console.log('✅ LOGIN SUKSES!');
    consecutiveFails = 0;
    retryDelay = 20000;
  });

  currentBot.once('spawn', () => {
    console.log('✅ SPAWN SUKSES!');
    
    setTimeout(() => {
      console.log('🔐 Register/Login...');
      currentBot.chat('/register 123456 123456');
      setTimeout(() => currentBot.chat('/login 123456'), 1500);
    }, 2000);
  });

  // ================= ANTI AFK =================
  let antiAFK;
  if (currentBot.entity) {
    antiAFK = setInterval(() => {
      if (currentBot.entity) {
        currentBot.setControlState('jump', true);
        setTimeout(() => currentBot.setControlState('jump', false), 250);
      }
    }, 25000);  // 25s
  }

  // ================= EVENTS =================
  currentBot.on('end', (reason) => {
    if (antiAFK) clearInterval(antiAFK);
    console.log('❌ Disconnect:', reason || 'unknown');
    
    // Server issues
    if (reason?.includes('socket') || reason?.includes('timeout') || !reason) {
      consecutiveFails++;
      console.log(`⚠️ Connection fail #${consecutiveFails}`);
      
      if (consecutiveFails >= MAX_CONSECUTIVE_FAILS) {
        console.log('🚨 MAX FAILS REACHED. STOPPING.');
        isStopping = true;
        return;
      }
    }
    
    retry();
  });

  currentBot.on('error', (err) => {
    console.log('⚠️ Connection Error:', err.message || err.code || 'unknown');
    consecutiveFails++;
    
    // 🔥 FIX: Gunakan end() bukan quit()
    try {
      if (currentBot) {
        currentBot.end();
      }
    } catch (e) {
      console.log('⚠️ End failed:', e.message);
    }
  });

  currentBot.on('kicked', (reason) => {
    console.log('👢 KICKED:', reason);
    retry();
  });

  // Auto restart setelah 10 menit
  setTimeout(() => {
    console.log('⏰ 10min restart');
    if (currentBot) currentBot.end();
  }, 600000);
}

// ================= RETRY =================
function retry() {
  if (consecutiveFails >= MAX_CONSECUTIVE_FAILS || isStopping) {
    console.log('🛑 NO MORE RETRY');
    return;
  }

  retryDelay = Math.min(retryDelay * 1.5, MAX_DELAY);  // Exponential backoff
  console.log(`🔄 Next retry: ${Math.round(retryDelay/1000)}s`);

  setTimeout(() => {
    start();
  }, retryDelay);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  isStopping = true;
  if (currentBot) {
    currentBot.end();
  }
  process.exit(0);
});

// ================= RUN =================
console.log('🚀 Minecraft Bot Started');
console.log('📡 Server:', CONFIG.host + ':' + CONFIG.port);
start();
