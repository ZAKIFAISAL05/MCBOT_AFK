const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'dynamic-8.magmanode.com',
  port: 25865,
  username: 'KeepAliveBot',
  version: '1.21.1', 
  auth: 'offline',
  viewDistance: 'tiny'
};

let retryCount = 0;
const MAX_RETRIES = 50;
let pingInterval = null;
let currentBot = null;

console.log('🚀 Railway Keep-Alive v4.3 - ANTI-KICK STABLE');
console.log('📡 Target:', CONFIG.host + ':' + CONFIG.port);

// --- TAMBAHAN DATA JADWAL SHOLAT (WIB) ---
const JADWAL_SHOLAT = [
  { nama: 'Subuh', jam: 4, menit: 40 },
  { nama: 'Dzuhur', jam: 12, menit: 0 },
  { nama: 'Ashar', jam: 15, menit: 15 },
  { nama: 'Maghrib', jam: 18, menit: 5 },
  { nama: 'Isya', jam: 19, menit: 15 }
];

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
      physicsEnabled: false, // PENTING: Matikan fisika agar tidak kena kick "Invalid Move"
      checkTimeoutInterval: 60000 
    });
  } catch (e) {
    console.log('❌ Bot creation failed:', e.message);
    setTimeout(connect, 5000);
    return;
  }
  
  currentBot.once('spawn', () => {
    console.log('✅ CONNECTED - BOT IN WORLD');
    retryCount = 0;
    
    // Memastikan bot tidak melakukan pergerakan apapun
    currentBot.clearControlStates();

    if (pingInterval) clearInterval(pingInterval);

    // Login logic
    setTimeout(() => {
      if (currentBot && currentBot.chat) {
        currentBot.chat('/login 123456');
        console.log('🔑 Login sent');
      }
    }, 5000); 

    // --- TAMBAHAN FITUR WAKTU SHOLAT ---
    setInterval(() => {
      const sekarang = new Date();
      // Konversi ke WIB (GMT+7)
      const wib = new Date(sekarang.getTime() + (7 * 60 * 60 * 1000) + (sekarang.getTimezoneOffset() * 60000));
      const jam = wib.getHours();
      const menit = wib.getMinutes();

      JADWAL_SHOLAT.forEach(s => {
        if (jam === s.jam && menit === s.min) {
          currentBot.chat(`[RIDFOT] Waktunya Sholat ${s.nama} untuk wilayah Indonesia dan sekitarnya.`);
        }
      });
    }, 60000);
  });

  // --- TAMBAHAN FITUR JOIN & DEATH DETECTION ---
  currentBot.on('playerJoined', (player) => {
    if (player.username !== currentBot.username) {
      currentBot.chat(`Halo ${player.username}, selamat datang!`);
    }
  });

  currentBot.on('message', msg => {
    const text = msg.toString();
    console.log('📨', text);
    
    if (text.includes('/register')) {
      currentBot.chat('/register 123456 123456');
    }

    // Cek pesan kematian
    const deathWords = ['slain', 'died', 'killed', 'fell', 'terbunuh', 'mati'];
    if (deathWords.some(word => text.toLowerCase().includes(word))) {
      currentBot.chat('Tetap semangat! Jangan menyerah setelah mati.');
    }
  });

  // Anti-AFK setiap 5 menit
  pingInterval = setInterval(() => {
    if (currentBot && currentBot.entity) {
      currentBot.chat('/me is still here'); 
      console.log('💚 Keep-alive pulse sent');
    }
  }, 5 * 60 * 1000);

  currentBot.on('end', (reason) => {
    console.log('❌ DISCONNECTED:', reason);
    if (pingInterval) clearInterval(pingInterval);
    currentBot = null;
    setTimeout(connect, 60000); 
  });

  currentBot.on('error', (err) => {
    console.log('⚠️ Error:', err.code || err.message);
  });

  currentBot.on('kicked', (reason) => {
    console.log('👢 KICKED REASON:', reason);
  });
}

connect();
