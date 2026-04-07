const mineflayer = require('mineflayer');
const { pathfinder, goals } = require('mineflayer-pathfinder');
const bedrock = require('mineflayer-bedrock');

// ==================== KONFIGURASI BOT ====================
const CONFIG = {
  host: 'Server_Partner.aternos.me', 
  port: 60725,                     
  username: 'y.m.b_assiten',       
  version: '1.21.11'               // VERSI SESUAI PERMINTAAN (1.21.11)
};

const RADIUS_JALAN = 12; // Radius patroli dalam blok
// =========================================================

function createBot() {
  console.log(`[${new Date().toLocaleTimeString()}] Menghubungkan ${CONFIG.username} (v${CONFIG.version}) ke ${CONFIG.host}:${CONFIG.port}...`);

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    offline: true // Sesuaikan jika server Aternos kamu Cracked/No-Auth
  });

  // Load plugin agar bot bisa jalan di Bedrock dan punya navigasi pintar
  bot.loadPlugin(bedrock);
  bot.loadPlugin(pathfinder);

  let spawnPoint = null;

  bot.once('spawn', () => {
    console.log(`[${new Date().toLocaleTimeString()}] ${CONFIG.username} BERHASIL MASUK!`);
    spawnPoint = bot.entity.position.clone();
    console.log(`Titik spawn terdeteksi di: ${Math.round(spawnPoint.x)}, ${Math.round(spawnPoint.z)}`);
    
    // Mulai siklus jalan-jalan
    startPatrolling(bot, spawnPoint);
  });

  function startPatrolling(bot, center) {
    const moveTask = () => {
      if (!bot.pathfinder) return;

      // Cari titik tujuan acak di sekitar spawn
      const targetX = center.x + (Math.random() - 0.5) * RADIUS_JALAN * 2;
      const targetZ = center.z + (Math.random() - 0.5) * RADIUS_JALAN * 2;

      // Bot akan berjalan, melompat, dan menghindari rintangan (Pathfinder)
      const goal = new goals.GoalNear(targetX, center.y, targetZ, 1);
      bot.pathfinder.setGoal(goal);
      
      console.log(`[${new Date().toLocaleTimeString()}] ${CONFIG.username} menuju koordinat: ${Math.round(targetX)}, ${Math.round(targetZ)}`);
    };

    // Saat sampai di tujuan, bot diam dulu 10 detik agar tidak terlihat mencurigakan
    bot.on('goal_reached', () => {
      setTimeout(moveTask, 10000 + (Math.random() * 5000));
    });

    moveTask();
  }

  // Auto-reconnect jika server restart atau bot terputus
  bot.on('end', (reason) => {
    console.log(`[${new Date().toLocaleTimeString()}] Bot Terputus: ${reason}. Mencoba masuk kembali dalam 20 detik...`);
    setTimeout(createBot, 20000);
  });

  bot.on('error', (err) => console.error('Terjadi Error:', err.message));
}

// Jalankan Bot
createBot();
