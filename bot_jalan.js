const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'dynamic-8.magmanode.com',
  port: 25865,
  username: 'KeepAliveBot',
  version: '1.21.1', // Sesuaikan dengan versi Paper kamu agar tidak mismatch
  auth: 'offline',
  viewDistance: 'tiny' // Mengurangi beban koneksi
};

let retryCount = 0;
const MAX_RETRIES = 50;
let pingInterval = null;
let currentBot = null;

console.log('🚀 Railway Keep-Alive v4.2 - STABLE VERSION');
console.log('📡 Target:', CONFIG.host + ':' + CONFIG.port);
console.log('⏳ Anti-Kick & Auto-Login Active');

function connect() {
  if (currentBot) {
    try { currentBot.quit(); } catch (e) {}
  }
  currentBot = null;
  
  retryCount++;
  console.log(`🔄 Try #${retryCount}/${MAX_RETRIES}`);
  
  try {
    currentBot = mineflayer.createBot({
      ...CONFIG,
      connectTimeout: 30000,
      // Update: Tambahkan check agar bot tidak melakukan pergerakan aneh saat spawn
      checkTimeoutInterval: 60000 
    });
  } catch (e) {
    console.log('❌ Bot creation failed:', e.message);
    setTimeout(connect, 5000);
    return;
  }
  
  currentBot.once('spawn', () => {
    console.log('✅ CONNECTED - SERVER ALIVE!');
    retryCount = 0;
    
    if (pingInterval) clearInterval(pingInterval);

    // Login logic
    setTimeout(() => {
      if (currentBot && currentBot.chat) {
        currentBot.chat('/login 123456');
        console.log('🔑 Login sent');
      }
    }, 5000); // Jeda lebih lama sedikit agar tidak dianggap spam
  });

  currentBot.on('message', msg => {
    const text = msg.toString();
    console.log('📨', text);
    
    if (text.includes('/register')) {
      currentBot.chat('/register 123456 123456');
    }
  });

  // Anti-AFK Ping lebih sering (setiap 5 menit)
  pingInterval = setInterval(() => {
    if (currentBot && currentBot.entity) {
      // Menggunakan perintah /me atau titik agar tidak dianggap spam
      currentBot.chat('/me is staying alive'); 
      console.log('💚 Keep-alive pulse sent');
    }
  }, 5 * 60 * 1000);

  currentBot.on('end', (reason) => {
    console.log('❌ DISCONNECTED:', reason);
    if (pingInterval) clearInterval(pingInterval);
    currentBot = null;
    
    // Retry delay 1 menit (tidak terlalu lama, tidak terlalu cepat)
    setTimeout(connect, 60000); 
  });

  currentBot.on('error', (err) => {
    console.log('⚠️ Error:', err.code || err.message);
  });

  currentBot.on('kicked', (reason) => {
    console.log('👢 KICKED REASON:', reason);
    // Jika kena kick "Invalid Move", pastikan server.properties sudah di-fix
  });
}

connect();
