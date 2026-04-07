const mineflayer = require('mineflayer');
const { pathfinder, goals } = require('mineflayer-pathfinder');

// ================= CONFIG =================
const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'y.m.b_assiten',
  version: false,
  auth: 'offline'
};

const RADIUS_JALAN = 12;

// retry system
let retryDelay = 15000;
const MAX_DELAY = 60000;

// anti crash (WAJIB di Railway)
process.on('uncaughtException', err => console.log('UNCAUGHT:', err));
process.on('unhandledRejection', err => console.log('UNHANDLED:', err));
// ==========================================

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
    console.log('❌ Gagal buat bot:', err.message);
    return retry();
  }

  bot.loadPlugin(pathfinder);

  let spawnPoint = null;
  let loggedIn = false;

  // ================= SPAWN =================
  bot.once('spawn', () => {
    console.log('✅ BOT MASUK SERVER');

    retryDelay = 15000;

    // ⏳ tunggu server stabil (PENTING buat Aternos)
    setTimeout(() => {
      console.log('🔐 Coba login...');

      // kirim login / register
      bot.chat('/register 123456 123456');
      bot.chat('/login 123456');

    }, 5000);

    // tunggu login sukses dulu baru jalan
    setTimeout(() => {
      spawnPoint = bot.entity.position.clone();
      startPatrol(bot, spawnPoint);
    }, 10000);
  });

  // ================= PATROL =================
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
      setTimeout(move, 15000 + Math.random() * 5000);
    });

    move();
  }

  // ================= ANTI AFK =================
  setInterval(() => {
    if (bot && bot.entity) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }
  }, 30000);

  // ================= DISCONNECT =================
  bot.on('end', (reason) => {
    console.log(`❌ Disconnect: ${reason}`);

    // kalau server belum siap → retry cepat
    if (reason && reason.includes('socketClosed')) {
      retryDelay = 5000;
    }

    retry();
  });

  bot.on('error', (err) => {
    console.log(`⚠️ Error: ${err.message}`);
  });

  function retry() {
    console.log(`🔄 Retry dalam ${retryDelay / 1000} detik...`);

    setTimeout(() => {
      retryDelay = Math.min(retryDelay + 10000, MAX_DELAY);
      createBot();
    }, retryDelay);
  }
}

createBot();
