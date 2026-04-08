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

// Railway + Aternos logging
console.log('🚀 Railway Aternos Keep-Alive v4.0');
console.log('📡 Target:', CONFIG.host + ':' + CONFIG.port);
console.log('💚 Password: 123456');

// Auto retry connection
function connect() {
  retryCount++;
  console.log(`🔄 Try #${retryCount}/${MAX_RETRIES}`);
  
  const bot = mineflayer.createBot({
    ...CONFIG,
    connectTimeout: 30000
  });
  
  bot.once('spawn', () => {
    console.log('✅ CONNECTED - SERVER ALIVE!');
    retryCount = 0;
    
    // Clear old ping
    if (pingInterval) clearInterval(pingInterval);
    
    // Login
    setTimeout(() => bot.chat('/login 123456'), 3000);
  });

  bot.on('message', msg => {
    const text = msg.toString();
    console.log('📨', text);
    if (text.includes('register')) {
      bot.chat('/register 123456 123456');
    }
  });

  // Keep alive ping
  pingInterval = setInterval(() => {
    if (bot.entity) {
      bot.chat('.');
      console.log('💚 Ping');
    }
  }, 20 * 60 * 1000); // 20 minutes

  bot.on('end', () => {
    console.log('❌ DC - Retry in 30s');
    if (retryCount < MAX_RETRIES) {
      setTimeout(connect, 30000);
    } else {
      console.log('🛑 Max retries');
    }
  });

  bot.on('error', (err) => {
    console.log('⚠️', err.code || err.message);
  });

  bot.on('kicked', (reason) => {
    console.log('👢 Kicked:', reason.translate || 'unknown');
  });
}

// Start after delay
setTimeout(connect, 10000);sambil cek 
