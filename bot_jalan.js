const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'KeepAliveBot',
  version: false,
  auth: 'offline'
};

let bot = null;
let checkInterval = null;
let isBotActive = false;

// Smart logging
console.log('🧠 SMART Keep-Alive Bot v5.0');
console.log('📡 ' + CONFIG.host + ':' + CONFIG.port);
console.log('🎯 Logic: Join if empty → Exit if players');

// ================= CHECK PLAYERS =================
async function checkPlayers() {
  try {
    const testBot = mineflayer.createBot({
      ...CONFIG,
      username: 'PlayerChecker_' + Date.now()
    });
    
    await new Promise((resolve, reject) => {
      testBot.once('error', reject);
      testBot.once('end', reject);
      
      testBot.once('spawn', () => {
        const playerCount = Object.keys(testBot.players).length - 1; // -1 for self
        console.log(`👥 Players online: ${playerCount}`);
        
        testBot.chat('/list');
        setTimeout(() => {
          testBot.quit();
          resolve(playerCount);
        }, 2000);
      });
    });
    
    return playerCount;
  } catch (e) {
    console.log('⚠️ Check failed:', e.message);
    return -1;
  }
}

// ================= SMART CONNECT =================
async function smartConnect() {
  const players = await checkPlayers();
  
  if (players > 0) {
    console.log('🚫 Players online - Bot OFF');
    if (bot) {
      bot.quit();
      bot = null;
    }
    return;
  }
  
  console.log('✅ Server empty - Bot JOIN');
  startKeepAliveBot();
}

// ================= KEEP-ALIVE BOT =================
function startKeepAliveBot() {
  if (bot) bot.quit();
  
  bot = mineflayer.createBot(CONFIG);
  isBotActive = true;
  
  bot.once('spawn', () => {
    console.log('✅ Keep-Alive ACTIVE');
    bot.chat('/login 123456');
  });

  bot.on('message', msg => {
    console.log('📨', msg.toString());
  });

  // Ping
  const pingInt = setInterval(() => {
    if (bot && bot.entity) {
      bot.chat('.');
    }
  }, 20 * 60 * 1000);

  bot.on('end', () => {
    console.log('❌ Bot DC');
    isBotActive = false;
    bot = null;
  });
}

// ================= MAIN LOOP =================
async function mainLoop() {
  await smartConnect();
  
  // Check every 5 minutes
  setTimeout(mainLoop, 5 * 60 * 1000);
}

// START
setTimeout(mainLoop, 10000);
