const { Client, LocalAuth } = require('whatsapp-web.js')

import axios from 'axios'
import _ from 'lodash'
import dayjs from 'dayjs'
import sharp from 'sharp'

// const WaClient = new Client({
//   restartOnAuthFail: true,
//   puppeteer: {
//     headless: true,
//     args: [
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--disable-dev-shm-usage',
//       '--disable-accelerated-2d-canvas',
//       '--no-first-run',
//       '--no-zygote',
//       '--single-process', // <- this one doesn't works in Windows
//       '--disable-gpu',
//     ],
//   },
//   authStrategy: new LocalAuth(),
// })

const WaClient = new Client({
  authStrategy: new LocalAuth(),
})

const compresImage = (attachmentData) => {
  // console.log(attachmentData)
  let imgBuffer = Buffer.from(attachmentData.data, 'base64')
  return new Promise((resolve, reject) => {
    sharp(imgBuffer)
      .resize(250)
      .jpeg({ quality: 60 })
      .toBuffer()
      .then((resizedImageBuffer) => {
        let resizedImageData = resizedImageBuffer.toString('base64')
        let resizedBase64 = `data:${attachmentData.mimetype};base64,${resizedImageData}`
        resolve({
          mimetype: attachmentData.mimetype,
          data: resizedImageData,
          filename: attachmentData.filename,
          filesize: resizedImageData.length,
        })
      })
      .catch((err) => {
        console.log(err)
        reject(err)
      })
  })
}

WaClient.on('message', async (msg) => {
  if (msg.body === '!ping') {
    WaClient.sendMessage(msg.from, 'pong')
  }

  if (msg.body === '!mentions') {
    // const contact = await msg.getContact()
    const chat = await msg.getChat()
    // chat.sendMessage(`Hi @${contact.number}!`, {
    //   mentions: [contact],
    // })

    chat.sendMessage(`Hello @6282165172678`, {
      mentions: ['6282165172678@c.us'],
    })
  }

  if (msg.hasQuotedMsg) {
    const quotedMsg = await msg.getQuotedMessage()
    const textBody = quotedMsg.body
    const result = msg.body.split(',').map((x) => +x)
    const sheet_no = textBody.substring(
      quotedMsg.body.search('AP-'),
      quotedMsg.body.search('AP-') + 11,
    )
    console.log(result)

    if (
      quotedMsg.body.includes('*AP-') &&
      quotedMsg.body.includes('*Work Order Closed*:') &&
      quotedMsg.body.includes('*Machine')
    ) {
      const score = _.sum(result) / result.length
      _.isNaN(score) || score > 5
        ? msg.reply(
            'Format rating WO harus 3 angka & dipisah dengan koma. \nRapi(1-5),Bersih(1-5),Cepat(1-5) \nContoh: 5,5,5',
          )
        : axios
            .post(`http://localhost:5000/maintenanceReport`, {
              sheet_no: sheet_no,
              feedback_note: msg.body,
              feedback_user: quotedMsg.from,
              feedback_score: score.toFixed(1),
            })
            .then((x) =>
              msg.reply(
                `Terimakasih, rating WO ${sheet_no} dengan bintang ${score.toFixed(
                  1,
                )} berhasil disimpan.`,
              ),
            )
            .catch((err) => msg.reply(err.message))
    }
  }

  if (msg.body === '!test' && msg.hasMedia) {
    const attachmentData = await msg.downloadMedia()
    console.log(attachmentData.filesize)
    compresImage(attachmentData)
      .then((x) => console.log(x.filesize))
      .catch((err) => console.log(err))
  }

  if (msg.body === '!groupinfo') {
    let chat = await msg.getChat()
    if (chat.isGroup) {
      msg.reply(`
            *Group Details*
            Name: ${chat.name}
            Description: ${chat.description}
            Created At: ${chat.createdAt.toString()}
            Created By: ${chat.owner.user}
            Participant count: ${chat.participants.length}
        `)
    } else {
      msg.reply('This command can only be used in a group!')
    }
  }

  if (msg.body === '!genba acip' && msg.hasMedia) {
    const attachmentData = await msg.downloadMedia()
    if (attachmentData.mimetype == 'image/jpeg') {
      compresImage(attachmentData)
        .then((compressed) =>
          axios
            .post(`http://localhost:5000/genbaAcip/${msg.id.id}`, {
              from: `${msg.from} | ${msg._data.notifyName}`,
              images1: compressed,
            })
            .then((res) => {
              console.log(res.data)
              let str = `Data berhasil disimpan.`
              msg.reply(str)
              WaClient.sendMessage(msg.from, `${res.data}`)
            })
            .catch((err) => msg.reply(err.message)),
        )
        .catch((err) => msg.reply(err.message))
    } else {
      msg.reply('Failed, format media bukan image/jpeg')
    }
  }

  if (msg.body.length > 1 && msg.hasMedia) {
    const attachmentData = await msg.downloadMedia()
    const update = msg.body.substring(0, 7)
    const id = msg.body.substring(8, 17)
    if (update == '!update') {
      if (attachmentData.mimetype == 'image/jpeg') {
        compresImage(attachmentData)
          .then((compressed) => {
            axios
              .post(`http://localhost:5000/genbaAcipUp/${id}`, {
                close_date: dayjs(),
                images2: compressed,
              })
              .then(() => {
                let str = `Sheet: ${id} data berhasil diupdate.`
                msg.reply(str)
              })
              .catch((err) => msg.reply(err.message))
          })
          .catch((err) => msg.reply(err.message))
      } else {
        msg.reply('Failed, format media bukan image/jpeg')
      }
    }
  }
})

export default WaClient
;(async () => {
  await WaClient.initialize()
})()
