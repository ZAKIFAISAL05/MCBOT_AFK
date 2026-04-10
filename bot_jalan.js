const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'PATNER_SMP_CBT-WvVs.exaroton.me',
  port: 48677,
  username: 'Y.M.B_ASSITEN',
  version: 'FALSE', 
  auth: 'offline',
  viewDistance: 'tiny'
};

let retryCount = 0;
const MAX_RETRIES = 50;
let pingInterval = null;
let currentBot = null;

console.log('🚀 Railway Keep-Alive v4.3 - ANTI-KICK STABLE');
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
      physicsEnabled: false, // PENTING: Matikan fisika agar tidak kena kick "Invalid Move"
      checkTimeoutInterval: 60000 
    });
  } catch (e) {
    console.log('❌ Bot creation failed:', e.message);
    setTimeout(connect, 5000);
    return;
  }
  
  currentBot.once('spawn', () => {
    console.log('✅ CONNEdCTED - BOT IN WORLD');
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
  });

  currentBot.on('message', msg => {
    const text = msg.toString();
    console.log('📨', text);
    
    if (text.includes('/register')) {
      currentBot.chat('/register 123456 123456');
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
