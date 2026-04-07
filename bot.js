const bedrock = require('bedrock-protocol');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725, // 🔥 port geyser (cek di aternos)
  username: 'y.m.b_assiten'
};

let retryDelay = 10000;
const MAX_DELAY = 60000;

process.on('uncaughtException', err => console.log('UNCAUGHT:', err));
process.on('unhandledRejection', err => console.log('UNHANDLED:', err));

function startBot() {
  console.log('🔌 Connecting Bedrock...');

  const client = bedrock.createClient({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    offline: true
  });

  let joined = false;

  // ================= JOIN =================
  client.on('join', () => {
    joined = true;
    console.log(`✅ BOT MASUK: ${CONFIG.username}`);

    // 🦘 anti AFK (lompat)
    setInterval(() => {
      try {
        client.queue('player_action', {
          action: 'jump'
        });
      } catch (e) {}
    }, 20000);

    // 🚶 gerak dikit biar dianggap player
    setInterval(() => {
      try {
        client.queue('move_player', {
          runtime_id: client.runtimeEntityId,
          position: {
            x: Math.random() * 2,
            y: 0,
            z: Math.random() * 2
          },
          pitch: 0,
          yaw: Math.random() * 360,
          head_yaw: 0,
          mode: 0,
          on_ground: true,
          tick: 0
        });
      } catch (e) {}
    }, 15000);

    // 💬 chat
    setTimeout(() => {
      try {
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: CONFIG.username,
          message: 'halo dari bot'
        });
      } catch (e) {}
    }, 5000);
  });

  // ================= KEEP ALIVE =================
  setInterval(() => {
    if (!joined) return;

    try {
      client.queue('tick_sync', {
        request_time: Date.now(),
        response_time: Date.now()
      });
    } catch (e) {}
  }, 10000);

  // ================= DISCONNECT =================
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
