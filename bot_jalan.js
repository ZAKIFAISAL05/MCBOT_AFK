tabhain biyar gak di kick kaya karter dan skin nya const mineflayer = require('mineflayer');

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

console.log('🚀 Railway Aternos Keep-Alive v4.1 - FIXED');
console.log('📡 Target:', CONFIG.host + ':' + CONFIG.port);
console.log('💚 Password: 123456');
console.log('⏳ 2 MINUTE RETRY MODE');

// Auto retry connection
function connect() {
  // ✅ SAFE QUIT - Check if bot exists and has quit method
  if (currentBot && typeof currentBot.quit === 'function') {
    try {
      currentBot.quit();
    } catch (e) {
      console.log('⚠️ Quit failed, ignoring...');
    }
  }
  currentBot = null;
  
  retryCount++;
  console.log(`🔄 Try #${retryCount}/${MAX_RETRIES}`);
  
  try {
    currentBot = mineflayer.createBot({
      ...CONFIG,
      connectTimeout: 30000
    });
  } catch (e) {
    console.log('❌ Bot creation failed:', e.message);
    setTimeout(connect, 5000);
    return;
  }
  
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
      if (currentBot && typeof currentBot.chat === 'function') {
        currentBot.chat('/login 123456');
        console.log('🔑 Login sent');
      }
    }, 3000);
  });

  currentBot.on('message', msg => {
    if (!currentBot) return;
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
    if (currentBot && currentBot.entity && typeof currentBot.chat === 'function') {
      currentBot.chat('.');
      console.log('💚 Ping sent');
    }
  }, 20 * 60 * 1000);

  currentBot.on('end', () => {
    console.log('❌ DISCONNECTED - Retry in 2min');
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
    currentBot = null; // ✅ Clear reference
    if (retryCount < MAX_RETRIES) {
      setTimeout(connect, 10000); // 2 MENIT
    } else {
      console.log('🛑 MAX RETRIES - Restart in 10min');
      retryCount = 0;
      setTimeout(connect, 60000); // 10 menit
    }
  });

  currentBot.on('error', (err) => {
    if (err.code === 'ECONNRESET') {
      console.log('🔴 Server OFFLINE - Auto retry in 2min...');
    } else if (err.code === 'ETIMEDOUT') {
      console.log('⏱️ Connection TIMEOUT - Server mungkin offline');
    } else {
      console.log('⚠️ Error:', err.code || err.message);
    }
    // Don't clear bot here, let 'end' event handle it
  });

  currentBot.on('kicked', (reason) => {
    console.log('👢 KICKED:', reason || 'unknown reason');
  });
}

// START SEKARANG!
connect();
