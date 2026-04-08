const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',  // ← UBAH INI
  port: 60725,                        // ← UBAH INI
  username: 'KeepAliveBot',
  version: false,
  auth: 'offline'
};

console.log('🚀 Aternos Keep-Alive Bot v3.0');
console.log('📡 ' + CONFIG.host + ':' + CONFIG.port);

// Create bot
const bot = mineflayer.createBot(CONFIG);

bot.once('spawn', () => {
  console.log('✅ Bot spawned - Server ALIVE!');
  
  // Login sequence
  setTimeout(() => bot.chat('/register 123456 123456'), 2000);
  setTimeout(() => bot.chat('/login 123456'), 4000);
});

bot.on('login', () => console.log('✅ Logged in!'));

// Keep alive ping
setInterval(() => {
  if (bot.entity) {
    bot.chat('.');
    console.log('💚 Alive ping');
  }
}, 1200000); // 20 minutes

bot.on('message', msg => {
  console.log('📨 ' + msg.toString());
});

bot.on('end', () => {
  console.log('❌ Disconnected - Restarting...');
  setTimeout(() => process.exit(1), 5000);
});

bot.on('kicked', reason => {
  console.log('👢 Kicked:', reason.translate);
});

bot.on('error', err => {
  console.log('⚠️ Error:', err.message);
});
