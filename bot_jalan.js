const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner_Cbt.aternos.me',
  port: 38130,
  username: 'YMB_' + Math.floor(Math.random() * 10000),
  version: '1.20.4', // lebih stabil daripada 1.21
  auth: 'offline',
  viewDistance: 'tiny'
};

let bot = null;
let retryCount = 0;
const MAX_RETRIES = 50;

let antiAfkInterval = null;
let randomMoveInterval = null;

console.log('🚀 KEEP ALIVE BOT v5.0 (ANTI-KICK + FABRIC READY)');
console.log('📡 Target:', CONFIG.host + ':' + CONFIG.port);

function connect() {
  if (bot) {
    try { bot.quit(); } catch (e) {}
  }

  bot = null;
  retryCount++;

  console.log(`🔄 Connecting... (${retryCount}/${MAX_RETRIES})`);

  try {
    bot = mineflayer.createBot({
      ...CONFIG,
      connectTimeout: 20000,
      physicsEnabled: true, // WAJIB aktif untuk Fabric
      hideErrors: true
    });
  } catch (err) {
    console.log('❌ Create bot error:', err.message);
    return setTimeout(connect, 5000);
  }

  bot.once('spawn', () => {
    console.log('✅ BOT MASUK SERVER');
    retryCount = 0;

    // LOGIN LEBIH CEPAT
    setTimeout(() => {
      if (!bot) return;
      bot.chat('/login 123456');
      console.log('🔑 Login dikirim');
    }, 2000);

    // CLEAR CONTROL
    bot.clearControlStates();

    startAntiAFK();
    startRandomMovement();
  });

  bot.on('message', (msg) => {
    const text = msg.toString();
    console.log('📨', text);

    if (text.includes('/register')) {
      bot.chat('/register 123456 123456');
      console.log('📝 Register dikirim');
    }
  });

  bot.on('kicked', (reason) => {
    console.log('👢 KICKED:', reason);
  });

  bot.on('end', (reason) => {
    console.log('❌ DISCONNECT:', reason);

    stopAll();

    if (retryCount < MAX_RETRIES) {
      setTimeout(connect, 15000);
    } else {
      console.log('⛔ Max retry tercapai');
    }
  });

  bot.on('error', (err) => {
    console.log('⚠️ ERROR:', err.message);
  });
}

/* =========================
   🧠 ANTI AFK SYSTEM
========================= */
function startAntiAFK() {
  if (antiAfkInterval) clearInterval(antiAfkInterval);

  antiAfkInterval = setInterval(() => {
    if (!bot || !bot.entity) return;

    bot.chat('/me online');
    console.log('💚 Keep alive chat');
  }, 4 * 60 * 1000);
}

/* =========================
   🤖 HUMAN-LIKE MOVEMENT
========================= */
function startRandomMovement() {
  if (randomMoveInterval) clearInterval(randomMoveInterval);

  randomMoveInterval = setInterval(() => {
    if (!bot || !bot.entity) return;

    const actions = ['jump', 'look', 'sneak'];

    const action = actions[Math.floor(Math.random() * actions.length)];

    switch (action) {
      case 'jump':
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 400);
        break;

      case 'sneak':
        bot.setControlState('sneak', true);
        setTimeout(() => bot.setControlState('sneak', false), 1000);
        break;

      case 'look':
        const yaw = bot.entity.yaw + (Math.random() - 0.5);
        const pitch = (Math.random() - 0.5) * 0.5;
        bot.look(yaw, pitch, true);
        break;
    }

    console.log('🤖 Random action:', action);

  }, 60 * 1000);
}

/* =========================
   🛑 CLEANUP
========================= */
function stopAll() {
  if (antiAfkInterval) clearInterval(antiAfkInterval);
  if (randomMoveInterval) clearInterval(randomMoveInterval);
}

/* =========================
   🚀 START
========================= */
connect();
