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

console.log('🚀 Railway Keep-Alive v4.6 - ANTI-KICK DYNAMIC');
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
      physicsEnabled: false, // MULAI DENGAN FALSE AGAR TIDAK KENA KICK
      checkTimeoutInterval: 60000 
    });
  } catch (e) {
    console.log('❌ Bot creation failed:', e.message);
    setTimeout(connect, 5000);
    return;
  }
  
  currentBot.once('spawn', () => {
    console.log('✅ CONNECTED - WAITING FOR SAFE LANDING...');
    retryCount = 0;

    // 1. SAFE LANDING: Aktifkan fisika setelah 10 detik napak di server
    setTimeout(() => {
      if (currentBot) {
        currentBot.physicsEnabled = true;
        console.log('🛡️ Physics Activated Safely');
      }
    }, 10000);

    // 2. AUTO LOGIN
    setTimeout(() => {
      if (currentBot && currentBot.chat) {
        currentBot.chat('/login 123456');
        console.log('🔑 Login sent');
      }
    }, 5000);

    // 3. GERAK RANDOM (Hanya jalan jika fisika sudah ON)
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

    // 4. HANCUR POHON (Hanya jalan jika fisika sudah ON)
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

  currentBot.on('message', msg => {
    const text = msg.toString();
    if (text.includes('/register')) {
      currentBot.chat('/register 123456 123456');
    }
  });

  currentBot.on('end', (reason) => {
    console.log('❌ DISCONNECTED:', reason);
    setTimeout(connect, 60000); 
  });

  currentBot.on('error', (err) => {
    console.log('⚠️ Error:', err.message);
  });
}

// Web Server agar Railway tetap mendeteksi app aktif
http.createServer((req, res) => {
  res.write('Bot is Online');
  res.end();
}).listen(3000);

connect();
