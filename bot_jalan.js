const mineflayer = require('mineflayer');
const { pathfinder, goals } = require('mineflayer-pathfinder');

const CONFIG = {  
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'y.m.b_assiten',

  // 🔥 AUTO VERSION (fix error 1.21.11)
  version: false,

  // kalau server premium ubah ke false
  auth: 'offline'
};

const RADIUS_JALAN = 12;

function createBot() {
  console.log(`[${new Date().toLocaleTimeString()}] Menghubungkan ke server...`);

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    auth: CONFIG.auth
  });

  bot.loadPlugin(pathfinder);

  let spawnPoint = null;

  bot.once('spawn', () => {
    console.log('✅ BOT MASUK SERVER');

    spawnPoint = bot.entity.position.clone();

    // 🔐 AUTO LOGIN (kalau pakai plugin login)
    setTimeout(() => {
      bot.chat('/register 123456 123456');
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

      console.log(`Jalan ke: ${Math.round(x)}, ${Math.round(z)}`);
    };

    bot.on('goal_reached', () => {
      setTimeout(move, 10000);
    });

    move();
  }

  bot.on('end', (reason) => {
    console.log('❌ Disconnect:', reason);
    console.log('🔄 Reconnect 15 detik...');
    setTimeout(createBot, 15000);
  });

  bot.on('error', (err) => {
    console.log('⚠️ Error:', err.message);
  });
}

createBot();
