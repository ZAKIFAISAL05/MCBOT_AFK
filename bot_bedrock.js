const bedrock = require('bedrock-protocol');

// ==================== KONFIGURASI ====================
const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'y.m.b_assiten',
  version: '1.21.11',
  offline: true // Wajib untuk server Aternos (Cracked)
};
// =====================================================

function createBot() {
  console.log(`[${new Date().toLocaleTimeString()}] Menghubungkan ke Bedrock Aternos...`);

  const client = bedrock.createClient({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    offline: CONFIG.offline,
    version: CONFIG.version
  });

  // Saat bot berhasil masuk (spawn)
  client.on('spawn', () => {
    console.log(`[${new Date().toLocaleTimeString()}] ✅ ${CONFIG.username} BERHASIL MASUK!`);
    
    // Kirim login otomatis setelah 10 detik
    setTimeout(() => {
      console.log('🔐 Mengirim Login/Register...');
      // Mengirim chat di Bedrock menggunakan paket 'text'
      client.queue('text', {
        type: 'chat',
        needs_translation: false,
        source_name: CONFIG.username,
        xuid: '',
        platform_chat_id: '',
        message: '/register 123456 123456'
      });

      setTimeout(() => {
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: CONFIG.username,
          xuid: '',
          platform_chat_id: '',
          message: '/login 123456'
        });
      }, 2000);
    }, 10000);
  });

  // Anti-AFK: Kirim paket pergerakan kecil setiap 30 detik agar tidak ditendang
  const antiAfk = setInterval(() => {
    if (client.status === 2) { // 2 artinya Client sedang di dalam game
        client.queue('player_auth_input', {
            pitch: 0, yaw: 0,
            position: { x: 0, y: 0, z: 0 },
            move_vector: { x: 0, z: 0.1 }, // Gerak dikit
            head_yaw: 0, input_data: { jump_down: false },
            input_mode: 'touch', play_mode: 'normal', tick: 0n
        });
    }
  }, 30000);

  // Jika diskonek, otomatis nyoba lagi
  client.on('disconnect', (packet) => {
    console.log(`[${new Date().toLocaleTimeString()}] ❌ Terputus: ${packet.message}`);
    clearInterval(antiAfk);
    console.log('🔄 Mencoba masuk lagi dalam 20 detik...');
    setTimeout(createBot, 20000);
  });

  client.on('error', (err) => {
    console.log(`[${new Date().toLocaleTimeString()}] ⚠️ Error: ${err.message}`);
  });
}

// Jalankan bot
createBot();
                    
