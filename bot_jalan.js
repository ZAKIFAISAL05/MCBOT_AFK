const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'KeepAliveBot',
  version: false,
  auth: 'offline'
};

let retryCount = 0;
const MAX_RETRIES = 50;

let currentBot = null;
let pingInterval = null;
let antiAfkInterval = null;

console.log('🚀 KeepAlive BOT FINAL (ANTI KICK + ANTI JOIN-LEFT)');
console.log('📡 Target:', CONFIG.host + ':' + CONFIG.port);

// ================= CONNECT =================
function connect() {
  if (currentBot) {
    try { currentBot.quit(); } catch (e) {}
  }

  currentBot = null;
  retryCount++;

  console.log(`🔄 Try #${retryCount}/${MAX_RETRIES}`);

  currentBot = mineflayer.createBot({
    ...CONFIG,
    connectTimeout: 30000
  });

  // ================= LOGIN =================
  currentBot.once('spawn', () => {
    console.log('✅ SPAWNED (world loaded)');

    retryCount = 0;

    // ⏳ Delay login biar gak ke-kick
    setTimeout(() => {
      if (!currentBot) return;

      currentBot.chat('/login 123456');
      console.log('🔑 Login sent');
    }, 8000);

    // 🚶 Gerak dikit biar gak dianggap bot
    setTimeout(() => {
      if (!currentBot) return;

      currentBot.setControlState('forward', true);

      setTimeout(() => {
        currentBot.setControlState('forward', false);
      }, 2000);

    }, 10000);

    // ================= ANTI AFK =================
    if (antiAfkInterval) clearInterval(antiAfkInterval);

    antiAfkInterval = setInterval(() => {
      if (!currentBot || !currentBot.entity) return;

      const actions = ['forward', 'back', 'left', 'right'];
      const action = actions[Math.floor(Math.random() * actions.length)];

      currentBot.setControlState(action, true);

      setTimeout(() => {
        currentBot.setControlState(action, false);
      }, 1000);

      // lompat random
      if (Math.random() < 0.3) {
        currentBot.setControlState('jump', true);
        setTimeout(() => {
          currentBot.setControlState('jump', false);
        }, 400);
      }

      // nengok random
      currentBot.look(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI - Math.PI / 2,
        true
      );

      console.log('🧠 Anti-AFK move');

    }, 15000);
  });

  // ================= CHAT DETECT =================
  currentBot.on('message', msg => {
    const text = msg.toString();
    console.log('📨', text);

    if (text.includes('register')) {
      currentBot.chat('/register 123456 123456');
      console.log('📝 Register sent');
    }

    if (text.includes('login')) {
      currentBot.chat('/login 123456');
      console.log('🔑 Login detected & sent');
    }

    if (text.toLowerCase().includes('welcome')) {
      console.log('💚 Successfully joined!');
    }
  });

  // ================= KEEP ALIVE =================
  pingInterval = setInterval(() => {
    if (currentBot) {
      currentBot.chat('afk');
      console.log('💚 Keep alive');
    }
  }, 5 * 60 * 1000);

  // ================= EVENTS =================
  currentBot.on('login', () => {
    console.log('🔌 Logged into server');
  });

  currentBot.on('kicked', reason => {
    console.log('👢 KICKED:', reason || 'unknown');
  });

  currentBot.on('error', err => {
    console.log('⚠️ ERROR:', err.code || err.message);
  });

  currentBot.on('end', () => {
    console.log('❌ DISCONNECTED');

    clearInterval(pingInterval);
    clearInterval(antiAfkInterval);

    currentBot = null;

    // ⏳ Delay reconnect biar gak spam
    if (retryCount < MAX_RETRIES) {
      console.log('🔄 Reconnect in 30s...');
      setTimeout(connect, 30000);
    } else {
      console.log('🛑 Max retries, cooldown 2 menit');
      retryCount = 0;
      setTimeout(connect, 120000);
    }
  });
}

// ================= START =================
connect();
