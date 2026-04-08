const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: 'Server_Partner.aternos.me',  // ← UBAH
  port: 60725,                        // ← UBAH  
  username: 'Bandotrok',
  version: false
});

console.log('🤖 Bandotrok Keep-Alive');
console.log('📡 ' + bot.options.host + ':' + bot.options.port);

bot.on('spawn', () => {
  console.log('✅ SPAWNED');
  bot.chat('/login 123456');
});

bot.on('message', (m) => {
  console.log(m.toString());
});

setInterval(() => {
  if (bot.entity) {
    bot.chat('kek');
  }
}, 900000); // 15 min

bot.on('end', () => {
  console.log('🔄 Restart...');
});
