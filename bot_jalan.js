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

console.log('🚀 Railway Aternos Keep-Alive v4.0');
console.log('📡', CONFIG.host + ':' + CONFIG.port);

function connect() {
  retryCount++;
  console.log(`🔄 #${retryCount}/${MAX_RETRIES}`);
  
  const bot = mineflayer.createBot({
    ...CONFIG,
    connectTimeout: 30000
  });
  
  bot.once('spawn', () => {
    console.log('✅ SERVER ALIVE!');
    retryCount = 0;
    bot.chat('/login 123456');
  });

  bot.on('message', msg => {
    console.log('📨', msg.toString());
    if (msg.toString().includes('register')) {
      bot.chat('/register 123456 123456');
    }
  });

  setInterval(() => {
    if (bot.entity) bot.chat('.');
  }, 1200000);

  bot.on('end', () => {
    console.log('❌ DC - 30s');
    if (retryCount < MAX_RETRIES) {
      setTimeout(connect, 30000);
    }
  });
}

setTimeout(connect, 10000);
