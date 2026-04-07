const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'y.m.b_assiten',
  version: false,
  auth: 'offline'
};

let retryDelay = 15000;
const MAX_DELAY = 60000;
let consecutiveFails = 0;
const MAX_CONSECUTIVE_FAILS = 5;
let isStopping = false;

process.on('uncaughtException', err => console.log('UNCAUGHT:', err));
process.on('unhandledRejection', err => console.log('UNHANDLED:', err));

// ================= START =================
function start() {
  if (isStopping) {
    console.log('🛑 STOPPED');
    return;
  }
  
  console.log(`⏳ Wait ${Math.round(retryDelay/1000)}s... [Fails: ${consecutiveFails}]`);

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
    consecutiveFails = 0;
    retryDelay = 15000;
    
    setTimeout(() => {
      console.log('🔐 Login...');
      bot.chat('/register 123456 123456');
      setTimeout(() => bot.chat('/login 123456'), 1000);
    }, 3000);
  });

  // ================= ANTI AFK =================
  const antiAFK = setInterval(() => {
    if (bot.entity) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
    }
  }, 30000);

  // ================= EVENTS =================
  const onEnd = (reason) => {
    clearInterval(antiAFK);
    console.log('❌ Disconnect:', reason);
    
    if (reason?.includes('socketClosed') || reason?.includes('timeout')) {
      consecutiveFails++;
      console.log(`⚠️ Server issue. Fails: ${consecutiveFails}`);
      
      if (consecutiveFails >= MAX_CONSECUTIVE_FAILS) {
        console.log('🚨 MAX FAILS. STOP.');
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
    bot.quit();
  });

  // Auto kill setelah 5 menit
  setTimeout(() => {
    if (bot.entity) {
      console.log('⏰ Auto kill 5min');
      bot.quit();
    }
  }, 300000);
}

// ================= RETRY =================
function retry() {
  if (consecutiveFails >= MAX_CONSECUTIVE_FAILS || isStopping) {
    console.log('🛑 NO MORE RETRY');
    return;
  }

  retryDelay = Math.min(retryDelay + 15000, MAX_DELAY);
  console.log(`🔄 Retry ${Math.round(retryDelay/1000)}s...`);

  setTimeout(() => {
    start();
  }, retryDelay);
}

// Ctrl+C stop
process.on('SIGINT', () => {
  console.log('\n🛑 Manual stop');
  isStopping = true;
  process.exit(0);
});

// RUN
console.log('🚀 Bot started. Ctrl+C to stop.');
start();
