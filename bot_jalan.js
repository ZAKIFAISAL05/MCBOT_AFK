const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'human_player_' + Date.now(), // 🔥 UNIQUE USERNAME
  version: false,
  auth: 'offline',
  connectTimeout: 60000,
  viewDistance: 3,        // 🔥 LOW VIEW
  checkTimeoutInterval: 60000
};

let retryDelay = 30000;
let consecutiveFails = 0;
let currentBot = null;
let isBotAlive = false;

console.log('🚀 Aternos Stealth Bot v2');

// ================= ULTRA STEALTH SPAWN =================
function createBot() {
  console.log('🔌 Stealth connect...');
  
  if (currentBot) currentBot.end();
  
  currentBot = mineflayer.createBot(CONFIG);

  currentBot.once('spawn', () => {
    console.log('✅ Spawned - Stealth mode ON');
    isBotAlive = true;
    
    // ================= CRITICAL: HUMAN SPAWN SEQUENCE =================
    setTimeout(() => {
      // 1. Look around like human
      currentBot.look(0, 0.1);
      console.log('👀 Looking around...');
    }, 2000);

    setTimeout(() => {
      // 2. Tiny walk forward
      currentBot.setControlState('forward', true);
      setTimeout(() => currentBot.setControlState('forward', false), 800);
      console.log('🚶 Tiny walk...');
    }, 5000);

    setTimeout(() => {
      // 3. Login AFTER movement
      console.log('🔐 Login...');
      currentBot.chat('/register 123456 123456');
    }, 8000);

    setTimeout(() => {
      currentBot.chat('/login 123456');
      console.log('✅ Login sent');
    }, 10000);
  });

  // ================= PERFECT ANTI-AFK =================
  let afkTimer = 0;
  const afkInterval = setInterval(() => {
    if (!isBotAlive || !currentBot.entity) return;
    
    afkTimer++;
    if (afkTimer % 3 === 0) { // Every 3 minutes
      // SUPER SUBTLE - just look around
      const yaw = (Math.random() - 0.5) * 0.5;
      const pitch = (Math.random() - 0.5) * 0.2;
      currentBot.look(yaw, pitch, false);
      console.log('👀 Subtle look');
    }
  }, 60000); // 1 min interval

  // ================= EVENTS =================
  currentBot.on('end', handleDisconnect);
  currentBot.on('error', handleError);
  currentBot.on('kicked', handleKick);
  
  function handleDisconnect(reason) {
    clearInterval(afkInterval);
    isBotAlive = false;
    console.log('❌ Disconnected:', reason?.slice(0, 50));
    retryConnect();
  }

  function handleError(err) {
    console.log('⚠️ Error:', err.message || err.code);
    retryConnect();
  }

  function handleKick(reason) {
    console.log('👢 KICKED:', reason.translate || 'unknown');
    // Aternos specific handling
    if (reason.translate === 'multiplayer.disconnect.invalid_player_movement') {
      console.log('🎯 Aternos anti-cheat - wait longer...');
      retryDelay = 120000; // 2 minutes
    }
    retryConnect();
  }
}

// ================= SMART RETRY =================
function retryConnect() {
  consecutiveFails++;
  const waitTime = Math.min(retryDelay * (1 + consecutiveFails * 0.2), 300000);
  
  console.log(`🔄 Retry in ${Math.round(waitTime/1000)}s [${consecutiveFails}]`);
  
  setTimeout(() => {
    if (consecutiveFails > 8) {
      console.log('🛑 Too many fails - stopping');
      process.exit(1);
    }
    createBot();
  }, waitTime);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  if (currentBot) currentBot.end();
  process.exit(0);
});

// ================= START =================
setTimeout(createBot, 5000); // Initial delay
