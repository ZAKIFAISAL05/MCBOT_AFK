const mineflayer = require('mineflayer');
const { pathfinder, goals } = require('mineflayer-pathfinder');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'y.m.b_assiten',
  version: false,
  auth: 'offline'
};

let retryDelay = 15000;
const MAX_DELAY = 60000;
let consecutiveFails = 0;  // 🔥 NEW: Hitung kegagalan beruntun
const MAX_CONSECUTIVE_FAILS = 5;  // 🔥 NEW: Batas maksimal
let isStopping = false;  // 🔥 NEW: Flag untuk stop

process.on('uncaughtException', err => console.log('UNCAUGHT:', err));
process.on('unhandledRejection', err => console.log('UNHANDLED:', err));

// ================= START =================
function start() {
  if (isStopping) {
    console.log('🛑 STOPPED: Tidak retry lagi');
    return;
  }
  
  console.log(`⏳ Tunggu server siap (${Math.round(retryDelay/1000)}s)... [Fail: ${consecutiveFails}]`);

  setTimeout(() => {
    createBot();
  }, retryDelay);
}

// ================= CREATE BOT =================
function createBot() {
  console.log('🔌 Connecting...');

  const bot = mineflayer.createBot(CONFIG);

  bot.once('spawn', () => {
    console.log('✅ SPAWN SUKSES!');
    consecutiveFails = 0;  // 🔥 RESET fail counter
    retryDelay = 15000;    // 🔥 RESET delay
    
    setTimeout(() => {
      console.log('🔐 Login...');
      bot.chat('/register 123456 123456');
      setTimeout(() => bot.chat('/login 123456'), 1000);
    }, 3000); // kurangi delay
  });

  // ================= ANTI AFK =================
  const antiAFK = setInterval(() => {
    if (bot.entity) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
    }
  }, 30000);

  // ================= DISCONNECT =================
  const onEnd = (reason) => {
    clearInterval(antiAFK);  // 🔥 CLEAR INTERVAL
    console.log('❌ Disconnect:', reason);
    
    // 🔥 ANALISIS REASON
    if (reason?.includes('socketClosed') || reason?.includes('timeout')) {
      consecutiveFails++;
      console.log(`⚠️ Server issue detected. Fails: ${consecutiveFails}`);
      
      if (consecutiveFails >= MAX_CONSECUTIVE_FAILS) {
        console.log('🚨 MAX FAILS REACHED. STOP RETRY.');
        isStopping = true;
        return;
      }
    }
    
    retry();
  };

  bot.on('end', onEnd);
  bot.on('error', (err) => {
    console.log('⚠️ Error:', err.message);
    consecutiveFails++;
    bot.quit(); // force quit
  });

  // 🔥 KILL BOT setelah 5 menit jika stuck
  setTimeout(() => {
    if (bot.entity) {
      console.log('⏰ Auto kill setelah 5 menit');
      bot.quit();
    }
  }, 300000);
}

// ================= RETRY =================
function retry() {
  if (consecutiveFails >= MAX_CONSECUTIVE_FAILS || isStopping) {
    console.log('🛑 STOP RETRY');
    return;
  }

  // 🔥 SMART DELAY
  const smartDelay = consecutiveFails > 3 ? 45000 : Math.min(retryDelay + 15000, MAX_DELAY);
  retryDelay = smartDelay;

  console.log(`🔄 Retry ${Math.round(smartDelay/1000)}s... [Fails: ${consecutiveFails}]`);

  setTimeout(() => {
    start();
  }, smartDelay);
}

// ================= MANUAL CONTROL =================
process.on('SIGINT', () => {
  console.log('\n🛑 Manual stop');
  isStopping = true;
  process.exit(0);
});

// ================= RUN =================
console.log('🚀 Bot started. Ctrl+C to stop.');
start();
