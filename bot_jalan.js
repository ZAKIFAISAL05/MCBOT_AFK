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

// Railway logging
console.log('🚀 Railway Aternos Keep-Alive');
console.log('📡 Target:', CONFIG.host + ':' + CONFIG.port);

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
    
    // Login
    setTimeout(() => bot.chat('/login 123456'), 3000);
  });

  bot.on('message', msg => {
    const text = msg.toString();
    console.log('📨', text);
    if (text.includes('register')) bot.chat('/register 123456 123456');
  });

  // Keep alive
  setInterval(() => {
    if (bot.entity) {
      bot.chat('.');
      console.log('💚 Ping');
    }
  }, 20 * 60 * 1000);

  bot.on('end', () => {
    console.log('❌ DC - Retry in 30s');
    if (retryCount < MAX_RETRIES) {
      setTimeout(connect, 30000);
    }
  });

  bot.on('error', (err) => {
    console.log('⚠️', err.code || err.message);
  });
}

// Start after delay
setTimeout(connect, 10000);
