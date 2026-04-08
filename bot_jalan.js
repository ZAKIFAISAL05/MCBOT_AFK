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
let pingInterval = null;
let antiAfkInterval = null;
let currentBot = null;

console.log('🚀 KeepAlive Anti-Kick Mode ON');

// Auto retry connection
function connect() {
  if (currentBot && typeof currentBot.quit === 'function') {
    try { currentBot.quit(); } catch (e) {}
  }

  currentBot = null;
  retryCount++;

  console.log(`🔄 Try #${retryCount}/${MAX_RETRIES}`);

  currentBot = mineflayer.createBot({
    ...CONFIG,
    connectTimeout: 30000
  });

  currentBot.once('spawn', () => {
    console.log('✅ CONNECTED');

    retryCount = 0;

    // LOGIN
    setTimeout(() => {
      currentBot.chat('/login 123456');
    }, 4000);

    // 🔥 ANTI AFK SYSTEM (BIAR GAK DIKICK)
    if (antiAfkInterval) clearInterval(antiAfkInterval);

    antiAfkInterval = setInterval(() => {
      if (!currentBot || !currentBot.entity) return;

      // Gerakan random
      const actions = ['forward', 'back', 'left', 'right'];
      const action = actions[Math.floor(Math.random() * actions.length)];

      currentBot.setControlState(action, true);

      setTimeout(() => {
        currentBot.setControlState(action, false);
      }, 1000);

      // Lompat random
      if (Math.random() < 0.3) {
        currentBot.setControlState('jump', true);
        setTimeout(() => {
          currentBot.setControlState('jump', false);
        }, 500);
      }

      // Liat random (head movement)
      currentBot.look(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI - Math.PI / 2,
        true
      );

      console.log('🧠 Anti-AFK action');
    }, 15000); // tiap 15 detik
  });

  currentBot.on('message', msg => {
    const text = msg.toString();

    if (text.includes('register')) {
      currentBot.chat('/register 123456 123456');
    }

    if (text.includes('login')) {
      currentBot.chat('/login 123456');
    }
  });

  // KEEP ALIVE CHAT
  pingInterval = setInterval(() => {
    if (currentBot) {
      currentBot.chat('afk');
      console.log('💚 Keep alive chat');
    }
  }, 5 * 60 * 1000); // 5 menit

  currentBot.on('end', () => {
    console.log('❌ DISCONNECTED');

    clearInterval(pingInterval);
    clearInterval(antiAfkInterval);

    if (retryCount < MAX_RETRIES) {
      setTimeout(connect, 10000);
    } else {
      retryCount = 0;
      setTimeout(connect, 60000);
    }
  });

  currentBot.on('kicked', (reason) => {
    console.log('👢 KICKED:', reason);
  });

  currentBot.on('error', err => {
    console.log('⚠️ Error:', err.code || err.message);
  });
}

connect();
