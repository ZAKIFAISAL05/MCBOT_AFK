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
let prayerInterval = null; // Tambahan untuk interval sholat
let currentBot = null;

console.log('🚀 Railway Keep-Alive v4.3 - ANTI-KICK STABLE');
console.log('📡 Target:', CONFIG.host + ':' + CONFIG.port);

// Data Waktu Sholat (Estimasi WIB)
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
    
    currentBot.clearControlStates();

    if (pingInterval) clearInterval(pingInterval);
    if (prayerInterval) clearInterval(prayerInterval);

    // Login logic
    setTimeout(() => {
      if (currentBot && currentBot.chat) {
        currentBot.chat('/login 123456');
        console.log('🔑 Login sent');
      }
    }, 5000); 

    // Fitur Cek Waktu Sholat (WIB)
    prayerInterval = setInterval(() => {
      const sekarang = new Date();
      const wib = new Date(sekarang.getTime() + (7 * 60 * 60 * 1000) + (sekarang.getTimezoneOffset() * 60000));
      const jam = wib.getHours();
      const menit = wib.getMinutes();

      JADWAL_SHOLAT.forEach(s => {
        if (jam === s.jam && menit === s.menit) {
          currentBot.chat(`✨ Waktunya Sholat ${s.nama} untuk wilayah Indonesia dan sekitarnya.`);
        }
      });
    }, 60000); // Cek setiap menit
  });

  // Fitur Deteksi Join
  currentBot.on('playerJoined', (player) => {
    if (player.username !== currentBot.username) {
      currentBot.chat(`Halo ${player.username}, selamat datang di server!`);
    }
  });

  currentBot.on('message', (msg, position) => {
    const text = msg.toString();
    console.log('📨', text);
    
    if (text.includes('/register')) {
      currentBot.chat('/register 123456 123456');
    }

    // Fitur Respon Pesan Kematian (Death Message)
    const deathKeywords = ['slain', 'died', 'killed', 'fell', 'terbunuh', 'mati'];
    if (deathKeywords.some(word => text.toLowerCase().includes(word)) && position === 'chat') {
       currentBot.chat('Turut berduka cita atas kematianmu... Semangat lagi ya!');
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
    if (prayerInterval) clearInterval(prayerInterval);
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
