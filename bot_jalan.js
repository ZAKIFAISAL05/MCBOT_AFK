const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'y.m.b_assiten',
  version: false,
  auth: 'offline'
};

let retryDelay = 10000;
const MAX_DELAY = 60000;

process.on('uncaughtException', err => console.log('UNCAUGHT:', err));
process.on('unhandledRejection', err => console.log('UNHANDLED:', err));

function startBot() {
  console.log('🔌 Connecting Java bot...');

  const bot = mineflayer.createBot(CONFIG);

  let spawned = false;

  // ================= SPAWN =================
  bot.once('spawn', () => {
    spawned = true;
    retryDelay = 10000;

    console.log(`✅ BOT MASUK: ${CONFIG.username}`);

    // 🔐 login/register (kalau pakai auth)
    setTimeout(() => {
      bot.chat('/register 123456 123456');
      bot.chat('/login 123456');
    }, 3000);

    // 🗣️ aktivitas biar dianggap player
    setTimeout(() => {
      bot.chat('halo');
      bot.setControlState('forward', true);

      setTimeout(() => {
        bot.setControlState('forward', false);
      }, 3000);
    }, 6000);
  });

  // ================= ANTI AFK =================
  setInterval(() => {
    if (bot.entity && spawned) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
    }
  }, 25000);

  // ================= RANDOM LOOK (biar natural) =================
  setInterval(() => {
    if (bot.entity && spawned) {
      const yaw = Math.random() * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * 0.5;
      bot.look(yaw, pitch, true);
    }
  }, 15000);

  // ================= DISCONNECT =================
  bot.on('end', (reason) => {
    console.log('❌ Disconnect:', reason);
    retry();
  });

  // ================= ERROR =================
  bot.on('error', (err) => {
    console.log('⚠️ Error:', err.message);
  });

  // ================= RETRY =================
  function retry() {
    console.log(`🔄 Retry ${retryDelay / 1000}s...`);

    setTimeout(() => {
      retryDelay = Math.min(retryDelay + 5000, MAX_DELAY);
      startBot();
    }, retryDelay);
  }
}

startBot();
