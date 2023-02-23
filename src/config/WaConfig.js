const {
  Client,
  Location,
  List,
  Buttons,
  LocalAuth,
} = require('whatsapp-web.js')

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
})

WaClient.on('message', async (msg) => {
  let data
  if (msg.body === '!buttons') {
    let button = new Buttons(
      'Silahkan pilih menu :',
      [{ body: 'Genba Angin' }, { body: 'Genba Maintenance' }],
      `Hello ${msg.rawData.notifyName}`,
    )
    WaClient.sendMessage(msg.from, button)
  } else if (msg.body === 'Genba Angin') {
    if (msg.rawData.type === 'buttons_response' && msg.hasQuotedMsg) {
      const quotedMsg = await msg.getQuotedMessage()
      if (quotedMsg.fromMe) {
        await quotedMsg.delete(true)
      }
      let button = new Buttons(
        'Silahkan pilih plant menu :',
        [{ body: 'GM1' }, { body: 'GM2' }],
        `Hello ${msg.rawData.notifyName}`,
      )
      await WaClient.sendMessage(msg.from, button)
    }
  } else if (msg.body === 'Genba Maintenance') {
    if (msg.rawData.type === 'buttons_response' && msg.hasQuotedMsg) {
      const quotedMsg = await msg.getQuotedMessage()
      if (quotedMsg.fromMe) {
        await quotedMsg.delete(true)
      }
      let button = new Buttons(
        'Silahkan pilih plant menu :',
        [{ body: 'GM1' }, { body: 'GM2' }],
        `Hello ${msg.rawData.notifyName}`,
      )
      await WaClient.sendMessage(msg.from, button)
    }
  }
})

//!-------------------

WaClient.on('message', async (msg) => {
  if (msg.body === '!start') {
    sendMenu1(msg.rawData)
  } else if (msg.body === 'Genba Angin' || msg.body === 'Genba Maintenance') {
    sendMenu2(msg.rawData)
  }
})

function sendMenu1(msg) {
  let button = new Buttons(
    'Silahkan pilih menu :',
    [{ body: 'Genba Angin' }, { body: 'Genba Maintenance' }],
    `Hello ${msg.notifyName}`,
  )
  WaClient.sendMessage(msg.from, button)
}

function sendMenu2(msg) {
  let button = new Buttons(
    'Silahkan pilih plant menu :',
    [{ body: 'GM1' }, { body: 'GM2' }],
    `Hello ${msg.notifyName}`,
  )
  if ((msg.type = 'buttons_response')) {
    msg.quotedMsg.delete(true)
  }

  WaClient.sendMessage(msg.from, button)
}

export default WaClient
;(async () => {
  await WaClient.initialize()
})()
