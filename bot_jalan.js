const mineflayer = require('mineflayer');
const { pathfinder, goals } = require('mineflayer-pathfinder');

// ==================== KONFIGURASI BOT ====================
const CONFIG = {  
  host: 'Server_Partner.aternos.me', 
  port: 60725,                     
  username: 'y.m.b_assiten',       
  version: '1.21.11'
};

const RADIUS_JALAN = 12;
// =========================================================

function createBot() {
  console.log(`[${new Date().toLocaleTimeString()}] Menghubungkan ${CONFIG.username} ke ${CONFIG.host}:${CONFIG.port}...`);

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    offline: true
  });

  bot.loadPlugin(pathfinder);

  let spawnPoint = null;

  bot.once('spawn', () => {
    console.log(`[${new Date().toLocaleTimeString()}] BOT MASUK!`);
    spawnPoint = bot.entity.position.clone();
    
    startPatrolling(bot, spawnPoint);
  });

  function startPatrolling(bot, center) {
    const moveTask = () => {
      const targetX = center.x + (Math.random() - 0.5) * RADIUS_JALAN * 2;
      const targetZ = center.z + (Math.random() - 0.5) * RADIUS_JALAN * 2;

      const goal = new goals.GoalNear(targetX, center.y, targetZ, 1);
      bot.pathfinder.setGoal(goal);

      console.log(`Jalan ke: ${Math.round(targetX)}, ${Math.round(targetZ)}`);
    };

    bot.on('goal_reached', () => {
      setTimeout(moveTask, 10000);
    });

    moveTask();
  }

  bot.on('end', () => {
    console.log('Reconnect 20 detik...');
    setTimeout(createBot, 20000);
  });

  bot.on('error', (err) => console.log(err.message));
}

createBot();
