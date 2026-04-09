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

console.log('🚀 Railway Keep-Alive v4.8 - NO LOGIN MODE');
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
      physicsEnabled: false, // Tetap false di awal agar tidak kena kick move packet
      checkTimeoutInterval: 60000 
    });
  } catch (e) {
    console.log('❌ Bot creation failed:', e.message);
    setTimeout(connect, 5000);
    return;
  }
  
  currentBot.once('spawn', () => {
    console.log('✅ CONNECTED - BOT IS IN THE WORLD');
    retryCount = 0;

    // 1. AKTIFKAN FISIKA (Jeda 10 detik agar stabil)
    setTimeout(() => {
      if (currentBot) {
        currentBot.physicsEnabled = true;
        console.log('🛡️ Physics Activated');
      }
    }, 10000);

    // 2. GERAK RANDOM (Mulai setelah 20 detik)
    setInterval(() => {
      if (!currentBot || !currentBot.entity || !currentBot.physicsEnabled) return;
      
      currentBot.setControlState('forward', true);
      currentBot.setControlState('jump', Math.random() > 0.5);
      
      setTimeout(() => {
        if (currentBot) {
          currentBot.setControlState('forward', false);
          currentBot.setControlState('jump', false);
        }
      }, 1500);
      
      currentBot.look(Math.random() * Math.PI * 2, 0);
    }, 20000);

    // 3. HANCUR POHON (Mulai setelah 25 detik)
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
    }, 25000);
  });

  // Fitur auto-register kalau tiba-tiba server minta (opsional, bisa dihapus)
  currentBot.on('message', msg => {
    const text = msg.toString();
    if (text.includes('/register')) {
      currentBot.chat('/register 123456 123456');
    }
  });

  currentBot.on('end', (reason) => {
    console.log('❌ DISCONNECTED:', reason);
    // Jika socketClosed, coba lagi dalam 30 detik
    setTimeout(connect, 30000); 
  });

  currentBot.on('error', (err) => {
    console.log('⚠️ Error:', err.message);
  });
  
  currentBot.on('kicked', (reason) => {
    console.log('👢 KICKED REASON:', reason);
  });
}

// Web Server buat Railway
http.createServer((req, res) => {
  res.write('Bot is Online');
  res.end();
}).listen(3000);

connect();
