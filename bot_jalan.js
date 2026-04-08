const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'KeepAliveBot',
  version: false,
  auth: 'offline'
};

let retryCount = 0;
const MAX_RETRIES = 50;
let pingInterval = null;
let currentBot = null;

console.log('🚀 Railway Aternos Keep-Alive v4.0');
console.log('📡 Target:', CONFIG.host + ':' + CONFIG.port);
console.log('💚 Password: 123456');
console.log('⏳ Bot started...');

// Auto retry connection
function connect() {
  // Kill old bot
  if (currentBot) {
    currentBot.quit();
    currentBot = null;
  }
  
  retryCount++;
  console.log(`🔄 Try #${retryCount}/${MAX_RETRIES}`);
  
  currentBot = mineflayer.createBot({
    ...CONFIG,
    connectTimeout: 30000
  });
  
  currentBot.once('spawn', () => {
    console.log('✅ CONNECTED - SERVER ALIVE!');
    retryCount = 0;
    
    // Clear old ping
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
    
    // Login
    setTimeout(() => {
      currentBot.chat('/login 123456');
      console.log('🔑 Login sent');
    }, 3000);
  });

  currentBot.on('message', msg => {
    const text = msg.toString();
    console.log('📨', text);
    
    if (text.includes('register')) {
      currentBot.chat('/register 123456 123456');
      console.log('📝 Register sent');
    }
    if (text.includes('Welcome') || text.includes('login')) {
      console.log('💚 Auth OK - Bot active!');
    }
  });

  // Keep alive ping setiap 20 menit
  pingInterval = setInterval(() => {
    if (currentBot && currentBot.entity) {
      currentBot.chat('.');
      console.log('💚 Ping sent');
    }
  }, 20 * 60 * 1000);

  currentBot.on('end', () => {
    console.log('❌ DISCONNECTED - Retry in 30s');
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
    if (retryCount < MAX_RETRIES) {
      setTimeout(connect, 30000);
    } else {
      console.log('🛑 MAX RETRIES REACHED - Restart in 5min');
      retryCount = 0;
      setTimeout(connect, 600000); // 5 menit
    }
  });

  currentBot.on('error', (err) => {
    if (err.code === 'ECONNRESET') {
      console.log('🔴 Server OFFLINE - Auto retry...');
    } else {
      console.log('⚠️ Error:', err.code || err.message);
    }
  });

  currentBot.on('kicked', (reason) => {
    console.log('👢 KICKED:', reason || 'unknown reason');
  });
}

// START SEKARANG!
connect();
