const mineflayer = require('mineflayer');
const { pathfinder, goals } = require('mineflayer-pathfinder');

const CONFIG = {  
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'y.m.b_assiten',
  version: false,
  auth: 'offline'
};

const RADIUS_JALAN = 12;

// 🔥 Delay retry (kalau server mati)
let retryDelay = 15000; // mulai 15 detik
const MAX_DELAY = 60000; // max 60 detik

function createBot() {
  console.log(`[${new Date().toLocaleTimeString()}] 🔌 Coba connect ke server...`);

  let bot;

  try {
    bot = mineflayer.createBot({
      host: CONFIG.host,
      port: CONFIG.port,
      username: CONFIG.username,
      version: CONFIG.version,
      auth: CONFIG.auth
    });
  } catch (err) {
    console.log('❌ Gagal create bot:', err.message);
    return retry();
  }

  bot.loadPlugin(pathfinder);

  let spawnPoint = null;

  bot.once('spawn', () => {
    console.log('✅ BOT BERHASIL MASUK SERVER');

    // reset delay kalau sukses
    retryDelay = 15000;

    spawnPoint = bot.entity.position.clone();

    // auto login kalau perlu
    setTimeout(() => {
      bot.chat('/login 123456');
    }, 3000);

    startPatrol(bot, spawnPoint);
  });

  function startPatrol(bot, center) {
    const move = () => {
      if (!bot.entity) return;

      const x = center.x + (Math.random() - 0.5) * RADIUS_JALAN * 2;
      const z = center.z + (Math.random() - 0.5) * RADIUS_JALAN * 2;

      const goal = new goals.GoalNear(x, center.y, z, 1);
      bot.pathfinder.setGoal(goal);

      console.log(`🚶 Jalan ke: ${Math.round(x)}, ${Math.round(z)}`);
    };

    bot.on('goal_reached', () => {
      setTimeout(move, 10000 + Math.random() * 5000);
    });

    move();
  }

  // ❌ kalau gagal connect / disconnect
  bot.on('end', (reason) => {
    console.log(`❌ Disconnect: ${reason}`);
    retry();
  });

  bot.on('error', (err) => {
    console.log(`⚠️ Error: ${err.message}`);
  });

  function retry() {
    console.log(`🔄 Retry dalam ${retryDelay / 1000} detik...`);

    setTimeout(() => {
      // naikkan delay biar gak spam
      retryDelay = Math.min(retryDelay + 10000, MAX_DELAY);
      createBot();
    }, retryDelay);
  }
}

createBot();
