const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',  // ← UBAH
  port: 60725,                        // ← UBAH
  version: false,
  auth: 'offline'
};

let mainBot = null;
let checkInterval = null;

console.log('🧠 Smart Keep-Alive v6.0');
console.log('📡 ' + CONFIG.host + ':' + CONFIG.port);
console.log('🎯 Empty=Join | Players=Quit');

// ================= PING BOT =================
function pingServer() {
  console.log('🔍 Ping...');
  
  const pingBot = mineflayer.createBot({
    ...CONFIG,
    username: 'PingBot_' + Date.now(),
    connectTimeout: 15000
  });
  
  pingBot.once('spawn', () => {
    const players = Object.keys(pingBot.players).length - 1;
    console.log(`👥 Players: ${players}`);
    
    // SMART LOGIC
    if (players === 0 && !mainBot) {
      console.log('🎯 EMPTY → JOIN');
      setTimeout(startMainBot, 2000);
    } else if (players > 0 && mainBot) {
      console.log('👥 PLAYERS → QUIT');
      if (mainBot) mainBot.quit();
    }
    
    pingBot.quit();
  });
  
  pingBot.on('end', () => {
    console.log('✅ Ping complete');
  });
  
  pingBot.on('error', (err) => {
    console.log('⚠️ Ping error:', err.message);
  });
}

// ================= MAIN BOT =================
function startMainBot() {
  mainBot = mineflayer.createBot({
    ...CONFIG,
    username: 'KeepAliveBot'
  });
  
  mainBot.once('spawn', () => {
    console.log('✅ KEEP-ALIVE JOINED');
    mainBot.chat('/login 123456');
  });
  
  mainBot.on('message', (msg) => {
    console.log('📨', msg.toString());
  });
  
  mainBot.on('end', () => {
    console.log('❌ Main bot quit');
    mainBot = null;
  });
}

// ================= LOOP =================
function startLoop() {
  pingServer();
  checkInterval = setInterval(pingServer, 3 * 60 * 1000); // 3 minutes
}

// START
setTimeout(startLoop, 5000);
