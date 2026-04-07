const bedrock = require('bedrock-protocol');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725, // 🔥 port geyser
  username: 'y.m.b_assiten'
};

let retryDelay = 10000;
const MAX_DELAY = 60000;

function startBot() {
  console.log('🔌 Connecting Bedrock...');

  const client = bedrock.createClient({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    offline: true
  });

  let joined = false;

  client.on('join', () => {
    joined = true;
    console.log('✅ BOT MASUK');

    // 💬 chat biar dianggap player
    setTimeout(() => {
      try {
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: CONFIG.username,
          message: 'halo'
        });
      } catch {}
    }, 5000);

    // 🦘 anti AFK
    setInterval(() => {
      try {
        client.queue('player_action', {
          action: 'jump'
        });
      } catch {}
    }, 20000);
  });

  client.on('disconnect', (packet) => {
    console.log('❌ Disconnect:', packet?.reason || 'unknown');
    retry();
  });

  client.on('error', (err) => {
    console.log('⚠️ Error:', err.message);
  });

  function retry() {
    console.log(`🔄 Retry ${retryDelay / 1000}s...`);

    setTimeout(() => {
      retryDelay = Math.min(retryDelay + 5000, MAX_DELAY);
      startBot();
    }, retryDelay);
  }
}

startBot();
