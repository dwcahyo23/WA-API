import pkg from 'whatsapp-web.js';

const { Client, LocalAuth } = pkg;

const WaClient = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu',
    ],
  },
  authStrategy: new LocalAuth(),
});

WaClient.on('message', (msg) => {
  if (msg.body === '!ping') {
    msg.reply('pong');
  }
});

export default WaClient;

(async () => {
  await WaClient.initialize();
})();
