const mineflayer = require('mineflayer');

const CONFIG = {
  host: 'Server_Partner.aternos.me',
  port: 60725,
  username: 'KeepAliveBot',
  version: false,
  auth: 'offline'
};

let mainBot = null;

console.log('🚀 Simple Smart v8.0');
console.log('📡 ' + CONFIG.host + ':' + CONFIG.port);

// Simple check
function simpleCheck() {
  console.log('🔍 Check...');
  
  const checker = mineflayer.createBot({
    ...CONFIG,
    username: 'CheckBot'
  });
  
  checker.once('spawn', () => {
    checker.chat('/list');
  });
  
  let gotList = false;
  
  checker.on('message', (msg) => {
    const text = msg.toString();
    if (text.includes('online: 0') || text.includes('Players (0)')) {
      console.log('👥 0 players → JOIN');
      if (!mainBot) startBot();
      gotList = true;
      checker.quit();
    } else if (text.includes('online: 1') || text.includes('Players (1)')) {
      console.log('👥 Players → QUIT');
      if (mainBot) mainBot.quit();
      gotList = true;
      checker.quit();
    }
  });
  
  checker.on('end', () => {
    if (!gotList) console.log('⚠️ No list response');
  });
}

function startBot() {
  mainBot = mineflayer.createBot(CONFIG);
  
  mainBot.once('spawn', () => {
    console.log('✅ JOINED');
    mainBot.chat('/login 123456');
  });
  
  mainBot.on('end', () => mainBot = null);
}

// 20s simple check
setInterval(simpleCheck, 20000);
setTimeout(simpleCheck, 5000);
