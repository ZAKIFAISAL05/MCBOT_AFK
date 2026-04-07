const bedrock = require('bedrock-protocol');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725, // tetap pakai ini kalau memang dari Aternos
  username: 'y.m.b_assiten'
};

let retryDelay = 5000;
const MAX_DELAY = 60000;

process.on('uncaughtException', err => console.log('UNCAUGHT:', err));
process.on('unhandledRejection', err => console.log('UNHANDLED:', err));

function startBot() {
  console.log('🔌 Connecting Bedrock...');

  const client = bedrock.createClient({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    offline: true,
    connectTimeout: 30000 // 🔥 anti ping timeout
  });

  let joined = false;

  // ================= JOIN =================
  client.on('join', () => {
    joined = true;
    retryDelay = 5000; // reset delay kalau sukses

    console.log(`✅ BOT MASUK: ${CONFIG.username}`);

    // 💬 kirim chat
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
      if (!joined) return;
      try {
        client.queue('player_action', {
          action: 'jump'
        });
      } catch {}
    }, 20000);

    // 🔄 keep alive (penting)
    setInterval(() => {
      if (!joined) return;
      try {
        client.queue('tick_sync', {
          request_time: Date.now(),
          response_time: Date.now()
        });
      } catch {}
    }, 10000);
  });

  // ================= DISCONNECT =================
  client.on('disconnect', (packet) => {
    console.log('❌ Disconnect:', packet?.reason || 'unknown');
    retry();
  });

  // ================= ERROR =================
  client.on('error', (err) => {
    console.log('⚠️ Error:', err.message);

    // kalau timeout → retry cepat
    if (err.message.includes('timed out')) {
      retryDelay = 5000;
    }
  });

  // ================= RETRY =================
  function retry() {
    console.log(`🔄 Retry ${retryDelay / 1000}s...`);

    setTimeout(() => {
      retryDelay = Math.min(retryDelay + 5000, MAX_DELAY);
      startBot();
    }, retryDelay);
  }
}

startBot();
