const mineflayer = require('mineflayer');
const http = require('http');

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
let currentBot = null;

console.log('🚀 Railway Keep-Alive v4.7 - ULTIMATE STABLE');
console.log('📡 Target:', CONFIG.host + ':' + CONFIG.port);

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
      // WAJIB FALSE DI AWAL: Supaya tidak kena kick "Invalid Move" saat login
      physicsEnabled: false, 
      checkTimeoutInterval: 60000 
    });
  } catch (e) {
    console.log('❌ Bot creation failed:', e.message);
    setTimeout(connect, 5000);
    return;
  }
  
  currentBot.once('spawn', () => {
    console.log('✅ CONNECTED - STANDING STILL FOR STABILITY...');
    retryCount = 0;

    // 1. LOGIN (Jeda 5 detik)
    setTimeout(() => {
      if (currentBot && currentBot.chat) {
        currentBot.chat('/login 123456');
        console.log('🔑 Login sent');
      }
    }, 5000);

    // 2. AKTIFKAN FISIKA (Jeda 15 detik setelah spawn)
    // Ini kuncinya agar tidak dianggap packet ilegal
    setTimeout(() => {
      if (currentBot) {
        currentBot.physicsEnabled = true;
        console.log('🛡️ Physics Shield Activated - Bot can now move');
      }
    }, 15000);

    // 3. GERAK RANDOM (Jeda 25 detik)
    setTimeout(() => {
      setInterval(() => {
        if (!currentBot || !currentBot.entity || !currentBot.physicsEnabled) return;
        currentBot.setControlState('forward', true);
        setTimeout(() => { if (currentBot) currentBot.setControlState('forward', false); }, 1000);
        currentBot.look(Math.random() * Math.PI * 2, 0);
      }, 20000);
    }, 25000);

    // 4. HANCUR POHON (Jeda 30 detik)
    setTimeout(() => {
      setInterval(() => {
        if (!currentBot || !currentBot.physicsEnabled) return;
        const woodBlock = currentBot.findBlock({
          matching: block => block.name.includes('log'), 
          maxDistance: 4
        });
        if (woodBlock) {
          console.log('🪓 Found wood, chopping...');
          currentBot.dig(woodBlock, (err) => {
            if (!err) console.log('✅ Wood chopped!');
          });
        }
      }, 30000);
    }, 30000);
  });

  currentBot.on('message', msg => {
    const text = msg.toString();
    if (text.includes('/register')) {
      currentBot.chat('/register 123456 123456');
    }
  });

  currentBot.on('end', (reason) => {
    console.log('❌ DISCONNECTED:', reason);
    setTimeout(connect, 30000); // Reconnect lebih cepat (30 detik)
  });

  currentBot.on('error', (err) => {
    console.log('⚠️ Error:', err.message);
  });
}

// Keep Railway service alive
http.createServer((req, res) => {
  res.write('Bot is Online');
  res.end();
}).listen(3000);

connect();
