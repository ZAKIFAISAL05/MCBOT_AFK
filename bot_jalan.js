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

console.log('🚀 Railway Keep-Alive v4.5 - DYNAMIC MODE');
console.log('📡 Target:', CONFIG.host + ':' + CONFIG.port);
console.log('⏳ Anti-Kick, Random Move & Woodcutter Active');

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
      physicsEnabled: true, // Diaktifkan lagi agar bisa gerak & hancur blok
      checkTimeoutInterval: 60000 
    });
  } catch (e) {
    console.log('❌ Bot creation failed:', e.message);
    setTimeout(connect, 5000);
    return;
  }
  
  currentBot.once('spawn', () => {
    console.log('✅ CONNECTED - BOT IS ALIVE!');
    retryCount = 0;
    
    if (pingInterval) clearInterval(pingInterval);

    // Login logic
    setTimeout(() => {
      if (currentBot && currentBot.chat) {
        currentBot.chat('/login 123456');
        console.log('🔑 Login sent');
      }
    }, 5000);

    // --- FITUR TAMBAHAN: GERAK RANDOM ---
    setInterval(() => {
      if (!currentBot || !currentBot.entity) return;
      const rx = Math.random() * 10 - 5;
      const rz = Math.random() * 10 - 5;
      currentBot.setControlState('forward', true);
      setTimeout(() => {
        if (currentBot) currentBot.setControlState('forward', false);
      }, 1000);
      currentBot.look(Math.random() * Math.PI * 2, 0);
    }, 15000);

    // --- FITUR TAMBAHAN: HANCUR POHON (SIMPEL) ---
    setInterval(() => {
      if (!currentBot) return;
      const woodBlock = currentBot.findBlock({
        matching: block => block.name.includes('log'), // Cari blok kayu apa saja
        maxDistance: 4
      });

      if (woodBlock) {
        console.log('🪓 Found wood, chopping...');
        currentBot.dig(woodBlock, (err) => {
          if (err) console.log('❌ Digging error:', err.message);
          else console.log('✅ Wood chopped!');
        });
      }
    }, 20000);
  });

  currentBot.on('message', msg => {
    const text = msg.toString();
    console.log('📨', text);
    if (text.includes('/register')) {
      currentBot.chat('/register 123456 123456');
    }
  });

  pingInterval = setInterval(() => {
    if (currentBot && currentBot.entity) {
      currentBot.chat('/me is working hard...'); 
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
