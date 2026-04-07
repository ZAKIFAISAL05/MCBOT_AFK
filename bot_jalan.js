const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'y.m.b_assiten',
  version: false,
  auth: 'offline',
  connectTimeout: 30000,
  hideErrors: false,
  checkTimeoutInterval: 30000
};

let retryDelay = 25000;
const MAX_DELAY = 120000;
let consecutiveFails = 0;
const MAX_CONSECUTIVE_FAILS = 5;
let isStopping = false;
let currentBot = null;

process.on('uncaughtException', err => console.log('💥', err.message));
process.on('unhandledRejection', err => console.log('💥', err.message));

// ================= START =================
function start() {
  if (isStopping) return console.log('🛑 STOPPED');
  
  console.log(`⏳ Wait ${Math.round(retryDelay/1000)}s [${consecutiveFails}/${MAX_CONSECUTIVE_FAILS}]`);

  setTimeout(createBot, retryDelay);
}

// ================= CREATE BOT =================
function createBot() {
  console.log('🔌 Connecting...');
  
  if (currentBot) {
    try { currentBot.end(); } catch(e){}
    currentBot = null;
  }

  currentBot = mineflayer.createBot(CONFIG);

  // ================= HUMANIZE BEHAVIOR =================
  currentBot.once('spawn', () => {
    console.log('✅ SPAWN!');
    
    // NO JUMP INSTANT - tunggu 10s
    setTimeout(() => {
      console.log('🔐 Login...');
      currentBot.chat('/register 123456 123456');
      setTimeout(() => currentBot.chat('/login 123456'), 2000);
    }, 10000); // 🔥 10s delay
  });

  currentBot.on('login', () => console.log('✅ LOGIN!'));

  // ================= GENTLE ANTI-AFK =================
  let antiAFKInterval;
  setTimeout(() => {
    antiAFKInterval = setInterval(humanAntiAFK, 60000); // 🔥 1 menit sekali
  }, 30000); // Start after 30s

  function humanAntiAFK() {
    if (!currentBot.entity) return;
    
    // Random human-like actions
    const actions = [
      () => {
        currentBot.setControlState('forward', true);
        setTimeout(() => currentBot.setControlState('forward', false), 500);
      },
      () => {
        currentBot.setControlState('jump', true);
        setTimeout(() => currentBot.setControlState('jump', false), 300);
      },
      () => {
        currentBot.look(Math.random() * 2 * Math.PI, 0, false);
      },
      () => {
        currentBot.chat(' .'); // Tiny dot chat
      }
    ];
    
    // Random action
    actions[Math.floor(Math.random() * actions.length)]();
  }

  // ================= EVENTS =================
  currentBot.on('end', (reason) => {
    if (antiAFKInterval) clearInterval(antiAFKInterval);
    console.log('❌ End:', reason || 'unknown');
    
    if (reason?.includes('socket') || reason?.includes('timeout')) {
      consecutiveFails++;
      if (consecutiveFails >= MAX_CONSECUTIVE_FAILS) {
        console.log('🚨 MAX FAILS');
        isStopping = true;
        return;
      }
    }
    retry();
  });

  currentBot.on('error', (err) => {
    console.log('⚠️ Error:', err.message || err.code);
    consecutiveFails++;
    try { if (currentBot) currentBot.end(); } catch(e){}
  });

  currentBot.on('kicked', (reason) => {
    console.log('👢 KICKED:', JSON.stringify(reason));
    // Parse kick reason
    if (reason?.translate === 'multiplayer.disconnect.invalid_player_movement') {
      console.log('🎯 Anti-cheat detected - slowing down...');
      retryDelay *= 2;
    }
    retry();
  });

  currentBot.on('message', (msg) => {
    const text = msg.toString();
    if (text.includes('register') || text.includes('login')) {
      console.log('📩 Server:', text);
    }
  });

  // Stay alive 15 menit max
  setTimeout(() => {
    console.log('⏰ 15min restart');
    if (currentBot) currentBot.end();
  }, 900000);
}

function retry() {
  if (isStopping || consecutiveFails >= MAX_CONSECUTIVE_FAILS) {
    console.log('🛑 STOP');
    return;
  }
  retryDelay = Math.min(retryDelay * 1.3, MAX_DELAY);
  console.log(`🔄 Retry ${Math.round(retryDelay/1000)}s`);
  setTimeout(start, retryDelay);
}

process.on('SIGINT', () => {
  console.log('\n🛑 Shutdown');
  isStopping = true;
  if (currentBot) currentBot.end();
  process.exit(0);
});

console.log('🚀 Human Bot Started');
start();
