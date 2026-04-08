const mineflayer = require('mineflayer');

const SERVER_CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  version: false,
  auth: 'offline'
};

// Generate unique username
const botId = Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
const CONFIG = {
  ...SERVER_CONFIG,
  username: `player_${botId.slice(-8)}`,  // player_abc123xy
  connectTimeout: 30000
};

let totalAttempts = 0;
let lastConnectTime = 0;

// ================= ANTI-DETECT BOT =================
function createBot() {
  const now = Date.now();
  const timeSinceLast = now - lastConnectTime;
  
  // Rate limit: min 60s between attempts
  if (timeSinceLast < 60000) {
    const wait = 60000 - timeSinceLast;
    console.log(`⏳ Rate limit - wait ${Math.round(wait/1000)}s`);
    setTimeout(createBot, wait);
    return;
  }
  
  lastConnectTime = now;
  totalAttempts++;
  console.log(`\n🤖 #${totalAttempts} | ${CONFIG.username}`);
  
  const bot = mineflayer.createBot(CONFIG);
  
  bot.once('spawn', () => {
    console.log('✅ SPAWNED - WAIT AUTH');
    
    // EXTREME SLOW login
    setTimeout(() => {
      bot.chat('/login 123456');
      console.log('🔑 Login (slow)');
    }, 15000); // 15s delay
  });

  // NO AFK - just stand still (most safe)
  // Anti-cheat can't detect standing player

  bot.on('message', (msg) => {
    const text = msg.toString();
    console.log('📨', text);
    
    // Auto register if needed
    if (text.includes('register')) {
      bot.chat('/register 123456 123456');
    }
  });

  bot.on('end', () => {
    console.log('❌ DC');
    // Slow retry 90s
    setTimeout(createBot, 90000);
  });

  bot.on('kicked', (reason) => {
    console.log('👢 KICK:', reason?.translate || 'server');
    setTimeout(createBot, 120000); // 2min
  });

  bot.on('error', (err) => {
    console.log('⚠️', err.code || err.message);
    setTimeout(createBot, 60000);
  });
}

// ================= START =================
console.log('🚀 Aternos Anti-Detect Bot');
console.log('👤 Unique ID:', CONFIG.username);
console.log('⏳ Initial wait 2min...');

setTimeout(createBot, 120000); // 2min initial
