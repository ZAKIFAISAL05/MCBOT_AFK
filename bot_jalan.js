
const mineflayer = require('mineflayer');
const { pathfinder, goals } = require('mineflayer-pathfinder');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'y.m.b_assiten',
  version: false,
  auth: 'offline'
};

let retryDelay = 15000;
const MAX_DELAY = 60000;

process.on('uncaughtException', err => console.log('UNCAUGHT:', err));
process.on('unhandledRejection', err => console.log('UNHANDLED:', err));

// ================= START (DELAY AWAL) =================
function start() {
  console.log('⏳ Tunggu server siap dulu (25 detik)...');

  setTimeout(() => {
    createBot();
  }, 25000); // 🔥 INI KUNCI
}

// ================= CREATE BOT =================
function createBot() {
  console.log('🔌 Connecting...');

  const bot = mineflayer.createBot(CONFIG);

  // ❌ sementara matikan pathfinder dulu (biar stabil)
  // bot.loadPlugin(pathfinder);

  bot.once('spawn', () => {
    console.log('✅ Spawn masuk');

    // ⏳ tunggu server stabil dulu
    setTimeout(() => {
      console.log('🔐 Login...');
      bot.chat('/register 123456 123456');
      bot.chat('/login 123456');
    }, 15000); // delay login
  });

  // ================= ANTI AFK =================
  setInterval(() => {
    if (bot.entity) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
    }
  }, 30000);

  // ================= DISCONNECT =================
  bot.on('end', (reason) => {
    console.log('❌ Disconnect:', reason);

    if (reason && reason.includes('socketClosed')) {
      retryDelay = 5000;
    }

    retry();
  });

  bot.on('error', err => console.log('⚠️', err.message));
}

// ================= RETRY =================
function retry() {
  console.log(`🔄 Retry ${retryDelay / 1000}s...`);

  setTimeout(() => {
    retryDelay = Math.min(retryDelay + 10000, MAX_DELAY);
    start(); // 🔥 BALIK KE START (BUKAN createBot)
  }, retryDelay);
}

// ================= RUN =================
start();
