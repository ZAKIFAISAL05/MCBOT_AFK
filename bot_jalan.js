const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',  // ← YOUR SERVER
  port: 60725,                        // ← YOUR PORT
  version: false,
  auth: 'offline'
};

let mainBot = null;
let checkCount = 0;

console.log('🚀 FAST Smart Keep-Alive v7.1');
console.log('📡 ' + CONFIG.host + ':' + CONFIG.port);
console.log('⏱️ 10s player check cycle');

// ================= 10s PLAYER CHECK =================
function checkPlayers() {
  checkCount++;
  console.log(`🔍 Check #${checkCount}`);
  
  const checker = mineflayer.createBot({
    ...CONFIG,
    username: 'Check_' + Date.now(),
    connectTimeout: 8000
  });
  
  checker.once('spawn', () => {
    const players = Object.keys(checker.players).length - 1;
    console.log(`👥 Players: ${players}`);
    
    // PERFECT LOGIC
    if (players === 0 && !mainBot) {
      console.log('🎯 EMPTY → JOIN');
      setTimeout(joinKeepAlive, 1000);
    } else if (players > 0 && mainBot) {
      console.log('👥 PLAYERS → QUIT');
      quitKeepAlive();
    }
    
    checker.quit();
  });
  
  checker.on('end', () => {
    // Silent fail
  });
  
  checker.on('error', () => {
    // Server offline = OK
  });
}

// ================= KEEP-ALIVE BOT =================
function joinKeepAlive() {
  mainBot = mineflayer.createBot({
    ...CONFIG,
    username: 'KeepAliveBot'
  });
  
  mainBot.once('spawn', () => {
    console.log('✅ KEEP-ALIVE JOINED');
    mainBot.chat('/login 123456');
  });
  
  mainBot.on('message', (msg) => {
    const text = msg.toString();
    if (text.includes('register')) {
      mainBot.chat('/register 123456 123456');
    }
  });
  
  mainBot.on('end', () => {
    console.log('❌ KEEP-ALIVE QUIT');
    mainBot = null;
  });
}

function quitKeepAlive() {
  if (mainBot) {
    mainBot.chat('bb');
    mainBot.quit();
  }
}

// ================= 10s LOOP =================
setInterval(checkPlayers, 10000);
checkPlayers(); // First check
