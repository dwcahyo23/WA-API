const {
  Client,
  Location,
  List,
  Buttons,
  LocalAuth,
} = require('whatsapp-web.js')

import axios from 'axios'
import mime from 'mime-types'

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

WaClient.on('message', (msg) => {
  if (msg.body == '!ping') {
    msg.reply('pong')
  } else if (msg.body == 'good morning') {
    msg.reply('selamat pagi')
  } else if (msg.body == '!groups') {
    WaClient.getChats().then((chats) => {
      const groups = chats.filter((chat) => chat.isGroup)

      if (groups.length == 0) {
        msg.reply('You have no group yet.')
      } else {
        let replyMsg = '*YOUR GROUPS*\n\n'
        groups.forEach((group, i) => {
          replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`
        })
        replyMsg += '_You can use the group id to send a message to the group._'
        msg.reply(replyMsg)
      }
    })
  }
})

// WaClient.on('message', async (msg) => {
//   let data
//   if (msg.body === '!buttons') {
//     let button = new Buttons(
//       'Silahkan pilih menu :',
//       [{ body: 'Genba Angin' }, { body: 'Genba Maintenance' }],
//       `Hello ${msg.rawData.notifyName}`,
//     )
//     WaClient.sendMessage(msg.from, button)
//   } else if (msg.body === 'Genba Angin') {
//     if (msg.rawData.type === 'buttons_response' && msg.hasQuotedMsg) {
//       const quotedMsg = await msg.getQuotedMessage()
//       if (quotedMsg.fromMe) {
//         await quotedMsg.delete(true)
//       }
//       let button = new Buttons(
//         'Silahkan pilih plant menu :',
//         [{ body: 'GM1' }, { body: 'GM2' }],
//         `Hello ${msg.rawData.notifyName}`,
//       )
//       await WaClient.sendMessage(msg.from, button)
//     }
//   } else if (msg.body === 'Genba Maintenance') {
//     if (msg.rawData.type === 'buttons_response' && msg.hasQuotedMsg) {
//       const quotedMsg = await msg.getQuotedMessage()
//       if (quotedMsg.fromMe) {
//         await quotedMsg.delete(true)
//       }
//       let button = new Buttons(
//         'Silahkan pilih plant menu :',
//         [{ body: 'GM1' }, { body: 'GM2' }],
//         `Hello ${msg.rawData.notifyName}`,
//       )
//       await WaClient.sendMessage(msg.from, button)
//     }
//   }
// })

// WaClient.on('message', async (msg) => {
//   if (msg.body === '!start') {
//     sendMenu1(msg.rawData)
//   } else if (msg.body === 'Genba Angin' || msg.body === 'Genba Maintenance') {
//     sendMenu2(msg.rawData)
//   }
// })

// function sendMenu1(msg) {
//   let button = new Buttons(
//     'Silahkan pilih menu :',
//     [{ body: 'Genba Angin' }, { body: 'Genba Maintenance' }],
//     `Hello ${msg.notifyName}`,
//   )
//   WaClient.sendMessage(msg.from, button)
// }

// function sendMenu2(msg) {
//   let button = new Buttons(
//     'Silahkan pilih plant menu :',
//     [{ body: 'GM1' }, { body: 'GM2' }],
//     `Hello ${msg.notifyName}`,
//   )
//   if ((msg.type = 'buttons_response')) {
//     msg.quotedMsg.delete(true)
//   }

//   WaClient.sendMessage(msg.from, button)
// }

// const postData = async (params) => {
//   const { name, mch_code, mch_com, mch_fin, mch_sprt, data, number } = params
//   await axios({
//     method: 'post',
//     url: 'http://localhost:5000/genba/create',
//     data: {
//       name,
//       mch_code,
//       mch_com,
//       mch_fin,
//       mch_sprt,
//       sts: 'Open',
//       data,
//     },
//   })
// }

// WaClient.on('message', async (msg) => {
//   if (msg.body == '!ping') {
//     msg.reply('pong')
//   }

//   const msgString = msg.body

//   if (msgString.indexOf('Genba') !== -1 && msg.hasMedia) {
//     const mch_code = msgString.substring(
//       msgString.indexOf('mc=') + 3,
//       msgString.indexOf('com=') - 1,
//     )
//     const mch_com = msgString.substring(
//       msgString.indexOf('com=') + 4,
//       msgString.indexOf('com=') + 5,
//     )
//     const mch_fin = msgString.substring(
//       msgString.indexOf('temuan=') + 7,
//       msgString.indexOf('sparepart=') - 1,
//     )
//     const mch_sprt = msgString.substring(msgString.indexOf('sparepart=') + 10)
//     const number = msg.from
//     await msg.downloadMedia().then((media) => {
//       try {
//         if (media) {
//           const extension = mime.extension(media.mimetype)
//           if (extension == 'jpeg') {
//             postData({
//               name: 'Genba',
//               mch_code,
//               mch_com,
//               mch_fin,
//               mch_sprt,
//               number,
//               data: `data:${media.mimetype};base64,${media.data}`,
//             })
//             msg.reply('success')
//           }
//         }
//       } catch (err) {
//         console.log(err.message)
//       }
//     })
//   }
// })

export default WaClient
;(async () => {
  await WaClient.initialize()
})()
