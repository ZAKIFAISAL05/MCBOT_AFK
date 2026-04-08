const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'afk_player',
  version: false,
  auth: 'offline',
  connectTimeout: 60000
};

let connectionCount = 0;
let isConnected = false;
let loginAttempted = false;

// ================= STABLE BOT =================
function startBot() {
  console.log(`\n🤖 #${++connectionCount} | ${CONFIG.username}`);
  
  const bot = mineflayer.createBot(CONFIG);
  
  bot.once('spawn', () => {
    console.log('✅ SPAWNED!');
    isConnected = true;
    connectionCount = 0;
    loginAttempted = false;
    
    // Safe login sequence
    setTimeout(() => {
      if (!loginAttempted) {
        bot.chat('/login 123456');
        console.log('🔑 Login sent');
        loginAttempted = true;
      }
    }, 8000);
  });

  bot.on('login', () => {
    console.log('✅ LOGGED IN - STABLE');
  });

  // Ultra-safe AFK (head rotate only)
  setInterval(() => {
    if (bot.entity && isConnected) {
      bot.look(0, Math.sin(Date.now() / 20000) * 0.05);
    }
  }, 240000); // 4 minutes

  // ================= EVENTS =================
  bot.on('end', handleDisconnect);
  bot.on('kicked', handleKick);
  bot.on('error', handleError);

  function handleDisconnect() {
    console.log('❌ DC');
    isConnected = false;
    safeRetry();
  }

  function handleKick(reason) {
    console.log('👢 KICK:', reason?.translate || 'unknown');
    isConnected = false;
    safeRetry();
  }

  function handleError(err) {
    console.log('⚠️ ERR:', err.message?.slice(0, 40) || err.code);
    safeRetry();
  }

  function safeRetry() {
    if (connectionCount < 100) {
      const delay = connectionCount > 5 ? 30000 : 15000;
      setTimeout(startBot, delay);
    } else {
      console.log('🛑 Max connections');
    }
  }

  // Monitor important messages
  bot.on('message', (msg) => {
    const text = msg.toString().toLowerCase();
    if (text.includes('login') || text.includes('register') || text.includes('password')) {
      console.log('📨', msg.toString());
    }
  });
}

// ================= START =================
console.log('🚀 Aternos Ultra Stable Bot v3.0');
console.log('📡', CONFIG.host + ':' + CONFIG.port);
console.log('⏳ Initial wait 45s (Aternos boot)...');

setTimeout(startBot, 45000);
