const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: 'Server_Partner.aternos.me',  // ← UBAH
  port: 60725,                        // ← UBAH
  username: 'Bandotrok',
  version: false
});

console.log('🤖 Bandotrok Keep-Alive v1.0');
console.log('📡 ' + bot.options.host + ':' + bot.options.port);

bot.on('spawn', () => {
  console.log('✅ SPAWNED');
  bot.chat('/login 123456');
});

bot.on('message', (message) => {
  console.log(message.toString());
});

bot.on('end', () => {
  console.log('🔄 Restarting...');
  setTimeout(() => {
    require('child_process').spawn(process.argv[0], process.argv.slice(1), {
      detached: true,
      stdio: 'ignore'
    }).unref();
    process.exit();
  }, 5000);
});

// Ping every 15 minutes
setInterval(() => {
  if (bot.entity) {
    bot.chat('kek');
  }
}, 15 * 60 * 1000);

process.on('uncaughtException', (err) => {
  console.log('Error:', err.message);
});
