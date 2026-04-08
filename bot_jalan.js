const mineflayer = require('mineflayer');

function randomName() {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let name = 'Bot_';
  for (let i = 0; i < 6; i++) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }
  return name;
}

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: randomName(), // 🔥 random username tiap start
  version: false,
  auth: 'offline'
};

let currentBot = null;
let retryCount = 0;
const MAX_RETRIES = 50;

let antiAfkInterval = null;
let pingInterval = null;

console.log('🚀 ADVANCED BOT (ANTI DETECT MODE)');
console.log('📡 Target:', CONFIG.host + ':' + CONFIG.port);

// ================= CONNECT =================
function connect() {
  if (currentBot) {
    try { currentBot.quit(); } catch (e) {}
  }

  // 🔥 username baru tiap reconnect
  CONFIG.username = randomName();

  retryCount++;
  console.log(`🔄 Connecting as ${CONFIG.username} (#${retryCount})`);

  currentBot = mineflayer.createBot({
    ...CONFIG,
    connectTimeout: 30000
  });

  // ================= SPAWN =================
  currentBot.once('spawn', () => {
    console.log('✅ SPAWNED');

    retryCount = 0;

    // ⏳ Delay random kayak manusia
    const loginDelay = 7000 + Math.random() * 5000;

    setTimeout(() => {
      if (!currentBot) return;

      currentBot.chat('/login 123456');
      console.log('🔑 Login sent');
    }, loginDelay);

    // 🚶 Gerakan awal (biar gak ke-detect bot)
    setTimeout(() => {
      if (!currentBot) return;

      currentBot.setControlState('forward', true);

      setTimeout(() => {
        currentBot.setControlState('forward', false);
      }, 1500 + Math.random() * 1500);

    }, loginDelay + 2000);

    // ================= ANTI AFK =================
    if (antiAfkInterval) clearInterval(antiAfkInterval);

    antiAfkInterval = setInterval(() => {
      if (!currentBot || !currentBot.entity) return;

      const actions = ['forward', 'back', 'left', 'right'];
      const action = actions[Math.floor(Math.random() * actions.length)];

      currentBot.setControlState(action, true);

      setTimeout(() => {
        currentBot.setControlState(action, false);
      }, 800 + Math.random() * 1200);

      // lompat random
      if (Math.random() < 0.4) {
        currentBot.setControlState('jump', true);
        setTimeout(() => {
          currentBot.setControlState('jump', false);
        }, 300);
      }

      // nengok random
      currentBot.look(
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * Math.PI,
        true
      );

      console.log('🧠 Human-like movement');

    }, 10000 + Math.random() * 10000); // random interval

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
      setTimeout(() => {
        currentBot.chat('/login 123456');
        console.log('🔑 Login (detected)');
      }, 2000);
    }

    if (text.toLowerCase().includes('welcome')) {
      console.log('💚 Successfully joined server');
    }
  });

  // ================= KEEP ALIVE =================
  if (pingInterval) clearInterval(pingInterval);

  pingInterval = setInterval(() => {
    if (!currentBot) return;

    const msgs = ['halo', 'afk', 'main bentar', 'lagi disini'];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];

    currentBot.chat(msg);
    console.log('💬 Chat:', msg);

  }, 300000 + Math.random() * 120000); // 5–7 menit

  // ================= EVENTS =================
  currentBot.on('login', () => {
    console.log('🔌 Logged in server');
  });

  currentBot.on('kicked', reason => {
    console.log('👢 KICKED:', reason || 'unknown');
  });

  currentBot.on('error', err => {
    console.log('⚠️ ERROR:', err.code || err.message);
  });

  currentBot.on('end', () => {
    console.log('❌ DISCONNECTED');

    clearInterval(antiAfkInterval);
    clearInterval(pingInterval);

    currentBot = null;

    // 🔥 delay random biar gak ke-detect spam reconnect
    let delay = 30000 + Math.random() * 30000;

    if (retryCount >= MAX_RETRIES) {
      console.log('🛑 Cooldown 2 menit');
      retryCount = 0;
      delay = 120000;
    }

    console.log(`🔄 Reconnect in ${Math.round(delay / 1000)}s`);
    setTimeout(connect, delay);
  });
}

// ================= START =================
connect();
