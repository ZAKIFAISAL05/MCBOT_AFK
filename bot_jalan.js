const mineflayer = require('mineflayer');

// KONFIGURASI - UBAH SESUAI SERVER
const CONFIG = {
  host: 'Server_Partner.aternos.me',  // ← UBAH
  port: 60725,                        // ← UBAH
  username: 'KeepAliveBot',
  version: false,
  auth: 'offline'
};

let reconnectTimer = null;
let isOnline = false;

console.log('🚀 Aternos Keep-Alive Bot v2.0');
console.log('📡 Server:', CONFIG.host + ':' + CONFIG.port);
console.log('💚 Password: 123456');

// ================= MAIN BOT =================
function connectBot() {
  console.log('\n🔌 Connecting...');
  
  const bot = mineflayer.createBot(CONFIG);
  
  bot.once('spawn', () => {
    console.log('✅ SPAWNED - SERVER SAFE!');
    isOnline = true;
    
    // Auto register/login
    setTimeout(() => {
      bot.chat('/register 123456 123456');
    }, 3000);
    
    setTimeout(() => {
      bot.chat('/login 123456');
    }, 6000);
  });

  // ================= KEEP ALIVE =================
  setInterval(() => {
    if (isOnline && bot.entity) {
      bot.chat('.');  // Invisible ping
      console.log('💚 Ping sent');
    }
  }, 20 * 60 * 1000); // 20 minutes

  // ================= EVENTS =================
  bot.on('login', () => {
    console.log('✅ LOGGED IN');
  });

  bot.on('message', (msg) => {
    const text = msg.toString();
    console.log('📨 ' + text);
  });

  bot.on('end', () => {
    console.log('❌ DISCONNECTED');
    isOnline = false;
    reconnectBot();
  });

  bot.on('kicked', (reason) => {
    console.log('👢 KICKED:', reason.translate || 'unknown');
    isOnline = false;
    reconnectBot();
  });

  bot.on('error', (err) => {
    console.log('⚠️ ERROR:', err.message);
  });
}

// ================= AUTO RECONNECT =================
function reconnectBot() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  
  reconnectTimer = setTimeout(() => {
    console.log('🔄 Auto reconnect...');
    connectBot();
  }, 30000); // 30s
}

// ================= START =================
connectBot();
