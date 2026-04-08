const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'stealth_' + Date.now(),
  version: '1.20',  // Aternos default
  auth: 'offline'
};

let retryDelay = 45000;  // 45s Aternos startup
let fails = 0;

// ================= WAIT ATERNOS START =================
console.log('⏳ Wait Aternos boot (45s)...');
setTimeout(createBot, 45000);

function createBot() {
  console.log(`🤖 Attempt ${++fails} - ${CONFIG.username}`);
  const bot = mineflayer.createBot(CONFIG);

  bot.once('spawn', () => {
    console.log('✅ SPAWNED!');
    fails = 0;
    retryDelay = 45000;
    
    // HUMAN SEQUENCE
    setTimeout(() => bot.look(0.2, 0.1), 3000);
    setTimeout(() => {
      bot.setControlState('forward', true);
      setTimeout(() => bot.setControlState('forward', false), 600);
    }, 7000);
    setTimeout(() => bot.chat('/register 123456 123456'), 12000);
    setTimeout(() => bot.chat('/login 123456'), 14000);
  });

  bot.on('login', () => console.log('✅ LOGIN'));
  
  // SUBTLE AFK
  setInterval(() => {
    if (bot.entity) bot.look(Math.random() * 0.3, Math.random() * 0.2);
  }, 180000); // 3 min

  bot.on('end', () => {
    console.log('❌ DC');
    if (fails < 10) {
      console.log(`🔄 Retry ${Math.round(retryDelay/1000)}s`);
      setTimeout(createBot, retryDelay);
      retryDelay = Math.min(retryDelay + 15000, 180000);
    } else {
      console.log('🛑 Max fails');
    }
  });

  bot.on('kicked', (r) => console.log('👢 KICK:', r.translate));
  bot.on('error', (e) => console.log('⚠️ ERR:', e.message));
}

console.log('🚀 Aternos Stealth Bot');
