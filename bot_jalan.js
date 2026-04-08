const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'KeepAliveBot',
  version: false,
  auth: 'offline'
};

let currentBot = null;
let checkTimer = null;

console.log('🧠 Smart Player Check Bot');
console.log('🎯 Empty → Join | Players → Quit');

// ================= PLAYER CHECK =================
async function checkServer() {
  console.log('🔍 Checking players...');
  
  const checker = mineflayer.createBot({
    ...CONFIG,
    username: 'Checker_' + Date.now()
  });
  
  return new Promise((resolve) => {
    checker.once('spawn', () => {
      const players = Object.keys(checker.players).length - 1;
      console.log(`👥 Players: ${players}`);
      
      checker.quit();
      resolve(players === 0);
    });
    
    checker.on('end', () => resolve(false));
    checker.on('error', () => resolve(false));
  });
}

// ================= JOIN BOT =================
async function joinBot() {
  if (currentBot) currentBot.quit();
  
  currentBot = mineflayer.createBot(CONFIG);
  
  currentBot.once('spawn', () => {
    console.log('✅ JOINED - Keeping alive');
    currentBot.chat('/login 123456');
  });

  currentBot.on('message', (msg) => {
    console.log(msg.toString());
  });

  currentBot.on('end', () => {
    console.log('❌ Quit');
    currentBot = null;
  });
}

// ================= QUIT BOT =================
function quitBot() {
  if (currentBot) {
    console.log('🚪 Player detected - QUIT');
    currentBot.quit();
    currentBot = null;
  }
}

// ================= MAIN LOOP =================
async function loop() {
  const isEmpty = await checkServer();
  
  if (isEmpty && !currentBot) {
    console.log('🎯 EMPTY → JOIN');
    joinBot();
  } else if (!isEmpty && currentBot) {
    console.log('👥 PLAYERS → QUIT');
    quitBot();
  }
  
  setTimeout(loop, 2 * 60 * 1000); // 2 minutes
}

// START
setTimeout(loop, 5000);
