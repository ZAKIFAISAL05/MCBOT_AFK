const mineflayer = require('mineflayer');
const { pathfinder, goals } = require('mineflayer-pathfinder');

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

function createBot() {
  console.log('🔌 Connecting...');

  const bot = mineflayer.createBot(CONFIG);
  bot.loadPlugin(pathfinder);

  let ready = false;

  // ================= SPAWN =================
  bot.once('spawn', () => {
    console.log('✅ Spawn masuk');

    // ❗ JANGAN langsung apa-apa
    setTimeout(() => {
      console.log('🔐 Kirim login...');
      bot.chat('/login 123456');
    }, 7000);
  });

  // ================= DETECT SERVER READY =================
  bot.on('message', (msg) => {
    const text = msg.toString();

    // kalau sudah login / masuk lobby
    if (
      text.toLowerCase().includes('welcome') ||
      text.toLowerCase().includes('berhasil') ||
      text.toLowerCase().includes('logged') ||
      text.toLowerCase().includes('selamat')
    ) {
      if (!ready) {
        ready = true;
        console.log('🟢 Server READY');

        setTimeout(() => startPatrol(bot), 5000);
      }
    }
  });

  // ================= PATROL =================
  function startPatrol(bot) {
    const center = bot.entity.position.clone();

    const move = () => {
      if (!bot.entity) return;

      const x = center.x + (Math.random() - 0.5) * 20;
      const z = center.z + (Math.random() - 0.5) * 20;

      const goal = new goals.GoalNear(x, center.y, z, 1);
      bot.pathfinder.setGoal(goal);

      console.log(`🚶 Jalan ke ${Math.round(x)}, ${Math.round(z)}`);
    };

    bot.on('goal_reached', () => {
      setTimeout(move, 15000);
    });

    move();
  }

  // ================= ANTI AFK =================
  setInterval(() => {
    if (bot.entity && ready) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
    }
  }, 30000);

  // ================= DISCONNECT =================
  bot.on('end', (reason) => {
    console.log('❌ Disconnect:', reason);

    // kalau socketClosed → server belum siap
    if (reason && reason.includes('socketClosed')) {
      retryDelay = 5000;
    }

    retry();
  });

  bot.on('error', err => console.log('⚠️', err.message));

  function retry() {
    console.log(`🔄 Retry ${retryDelay / 1000}s...`);

    setTimeout(() => {
      retryDelay = Math.min(retryDelay + 5000, MAX_DELAY);
      createBot();
    }, retryDelay);
  }
}

createBot();
