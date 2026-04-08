const mineflayer = require('mineflayer');
const { setTimeout: wait } = require('timers/promises');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'player_' + Math.floor(Math.random()*10000),
  version: '1.20.4',  // 🔥 SPECIFIC VERSION
  auth: 'offline'
};

let retryCount = 0;
const MAX_RETRIES = 20;
let serverReady = false;

// ================= PING SERVER FIRST =================
async function checkServer() {
  console.log('🌐 PING server...');
  
  const mcData = require('minecraft-data')(CONFIG.version);
  const { ping } = require('minecraft-protocol');
  
  try {
    const result = await ping({
      host: CONFIG.host,
      port: CONFIG.port,
      version: CONFIG.version,
      timeout: 5000
    });
    
    console.log('✅ Server ONLINE:', result.players.online + '/' + result.players.max);
    serverReady = true;
    return true;
  } catch (e) {
    console.log('❌ Server OFFLINE - wait 30s');
    serverReady = false;
    return false;
  }
}

// ================= MAIN BOT =================
async function createBot() {
  if (!serverReady) {
    console.log('⏳ Server not ready - retry ping...');
    setTimeout(mainLoop, 30000);
    return;
  }

  console.log(`🤖 Bot #${retryCount} connecting...`);
  
  const bot = mineflayer.createBot(CONFIG);
  
  bot.once('spawn', async () => {
    console.log('✅ SPAWNED!');
    retryCount = 0;
    
    // Human delay
    await wait(5000);
    bot.look(0.1, 0.05);
    await wait(3000);
    
    bot.chat('/register 123456 123456');
    await wait(1500);
    bot.chat('/login 123456');
  });

  bot.on('login', () => console.log('✅ LOGGED IN'));
  
  // Anti-AFK subtle
  setInterval(() => {
    if (bot.entity) {
      bot.look(Math.random()*0.2, Math.random()*0.1);
    }
  }, 120000); // 2 minutes

  bot.on('end', () => {
    console.log('❌ DISCONNECTED');
    retryCount++;
    setTimeout(mainLoop, 10000);
  });

  bot.on('kicked', (reason) => {
    console.log('👢 KICKED:', reason.translate || 'unknown');
    retryCount++;
    setTimeout(mainLoop, 15000);
  });

  bot.on('error', (err) => {
    console.log('⚠️ ERROR:', err.code || err.message);
    retryCount++;
    try { bot.end(); } catch(e){}
    setTimeout(mainLoop, 10000);
  });
}

// ================= MAIN LOOP =================
async function mainLoop() {
  if (retryCount > MAX_RETRIES) {
    console.log('🛑 MAX RETRIES - STOP');
    return;
  }
  
  await checkServer();
  if (serverReady) {
    createBot();
  } else {
    setTimeout(mainLoop, 30000);
  }
}

// START
console.log('🚀 Aternos Smart Bot');
console.log('📡 Target:', CONFIG.host + ':' + CONFIG.port);

mainLoop();
