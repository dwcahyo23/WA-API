const { Client, LocalAuth } = require('whatsapp-web.js')

import axios from 'axios'
import _ from 'lodash'
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

// WaClient.on('message', async (msg) => {
//   // console.log('MESSAGE RECEIVED', msg)

//   if (msg.body === '!ping reply') {
//     // Send a new message as a reply to the current one
//     msg.reply('pong')
//   } else if (msg.body === '!ping') {
//     // Send a new message to the same chat
//     // console.log(msg)
//     WaClient.sendMessage(msg.from, 'pong')
//   } else if (msg.body == '!groups') {
//     WaClient.getChats().then((chats) => {
//       const groups = chats.filter((chat) => chat.isGroup)

//       if (groups.length == 0) {
//         msg.reply('You have no group yet.')
//       } else {
//         let replyMsg = '*YOUR GROUPS*\n\n'
//         groups.forEach((group, i) => {
//           replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`
//         })
//         replyMsg += '_You can use the group id to send a message to the group._'
//         msg.reply(replyMsg)
//       }
//     })
//   } else if (msg.body === '!groupinfo') {
//     let chat = await msg.getChat()
//     if (chat.isGroup) {
//       msg.reply(`
//             *Group Details*
//             Name: ${chat.name}
//             Description: ${chat.description}
//             Created At: ${chat.createdAt.toString()}
//             Created By: ${chat.owner.user}
//             Participant count: ${chat.participants.length}
//         `)
//     } else {
//       msg.reply('This command can only be used in a group!')
//     }
//   } else if (msg.body === '!chats') {
//     const chats = await WaClient.getChats()
//     WaClient.sendMessage(msg.from, `The bot has ${chats.length} chats open.`)
//   } else if (msg.body === '!info') {
//     let info = WaClient.info
//     WaClient.sendMessage(
//       msg.from,
//       `
//         *Connection info*
//         User name: ${info.pushname}
//         My number: ${info.wid.user}
//         Platform: ${info.platform}
//     `,
//     )
//   } else if (msg.body === '!mediainfo' && msg.hasMedia) {
//     const attachmentData = await msg.downloadMedia()
//     msg.reply(`
//         *Media info*
//         MimeType: ${attachmentData.mimetype}
//         Data (length): ${attachmentData.data.length}
//     `)

//     // try {
//     //   axios.post('http://192.168.192.7:5000/genbaAcip', [
//     //     {
//     //       id: msg.id.id,
//     //       from: `${msg.from} | ${msg._data.notifyName}`,
//     //       images1: `data:${attachmentData.mimetype};base64,${attachmentData.data}`,
//     //     },
//     //   ])
//     // } catch (error) {
//     //   console.log(error.message)
//     // }
//   } else if (msg.body === '!quoteinfo' && msg.hasQuotedMsg) {
//     const quotedMsg = await msg.getQuotedMessage()

//     quotedMsg.reply(`
//         ID: ${quotedMsg.id._serialized}
//         Type: ${quotedMsg.type}
//         Author: ${quotedMsg.author || quotedMsg.from}
//         Timestamp: ${quotedMsg.timestamp}
//         Has Media? ${quotedMsg.hasMedia}
//     `)
//   } else if (msg.body === '!resendmedia' && msg.hasQuotedMsg) {
//     const quotedMsg = await msg.getQuotedMessage()
//     if (quotedMsg.hasMedia) {
//       const attachmentData = await quotedMsg.downloadMedia()
//       WaClient.sendMessage(msg.from, attachmentData, {
//         caption: "Here's your requested media.",
//       })
//     }
//   }
// })

let data = [
  {
    id: 1,
    received: 'Dept',
    key: 'dept',
    reply: 'Departement was successfuly updated!',
  },
  {
    id: 2,
    received: 'Plant',
    key: 'com',
    reply: 'Plant company was successfuly updated!',
  },
  {
    id: 3,
    received: 'Area',
    key: 'area',
    reply: 'Area genba was successfuly updated!',
  },
  {
    id: 4,
    received: 'Mc',
    key: 'mch_code',
    reply: 'Machine genba was successfuly updated!',
  },
  {
    id: 5,
    received: 'Cat',
    key: 'cat',
    reply: 'Category genba was successfuly updated!',
  },
  {
    id: 6,
    received: 'Case',
    key: 'case',
    reply: 'Case genba was successfuly updated!',
  },
  {
    id: 7,
    received: 'R1',
    key: 'a_r1',
    reply: 'Ringkas was successfuly updated!',
  },
  {
    id: 8,
    received: 'R2',
    key: 'a_r2',
    reply: 'Rapi was successfuly updated!',
  },
  {
    id: 9,
    received: 'R3',
    key: 'a_r3',
    reply: 'Resik was successfuly updated!',
  },
  {
    id: 10,
    received: 'R4',
    key: 'a_r4',
    reply: 'Rawat was successfuly updated!',
  },
  {
    id: 11,
    received: 'R5',
    key: 'a_r5',
    reply: 'Rajin was successfuly updated!',
  },
]

WaClient.on('message', async (msg) => {
  if (msg.body === '!genba acip' && msg.hasMedia) {
    const attachmentData = await msg.downloadMedia()
    // console.log(msg.id.id)
    await axios
      .post(`http://192.168.192.7:5000/genbaAcip/${msg.id.id}`, {
        from: `${msg.from} | ${msg._data.notifyName}`,
        images1: `data:${attachmentData.mimetype};base64,${attachmentData.data}`,
      })
      .then(() => {
        let str = `Data berhasil disimpan`
        str += `data berhasil disimpan!
        \nCara update data:
        \n1. Quote genba diatas, dengan cara pesan digeser ke kanan,\n2.Tulis salah satu paramater dibawah beserta value parameternya,        
        \n\nKeterangan Parameter:
        \nDept: u/ departement(2 digit),\nPlant: u/ plant company(GM1,GM2,GM3,GM5,GMX,GMU),\nArea: u/ area genba,\nMc: u/ kode mesin,\nCat: u/ category genba,\nCase: u/ temuan genba,\nR1: u/ nilai Ringas,\nR2: u/ nilai Rapi,\nR3: u/ nilai Resik,\nR4: u/ nilai Rawat,\nR5: u/ nilai Rajin
        \n\ncontoh: \nDept: PD
      `
        msg.reply(str)
      })
      .catch((err) => msg.reply(err.message))
  }

  if (
    msg.body.length > 1 &&
    msg.hasQuotedMsg &&
    msg._data.quotedMsg.type === 'image'
  ) {
    const keys = msg.body.substring(0, msg.body.indexOf(':'))
    const val = msg.body.slice(msg.body.indexOf(':') + 2)
    const quotedMsg = await msg.getQuotedMessage()
    // console.log(msg)
    _.filter(data, (x) => {
      if (x.received == keys) {
        let obj = {}
        obj[x.key] = val
        console.log(obj)
        axios
          .post(`http://192.168.192.7:5000/genbaAcip/${quotedMsg.id.id}`, {
            ...obj,
          })
          .then((d) => msg.reply(x.reply))
          .catch((err) => msg.reply(err.message))
      }
    })
  }
})

export default WaClient
;(async () => {
  await WaClient.initialize()
})()
