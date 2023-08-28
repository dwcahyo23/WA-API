const { Client, LocalAuth } = require('whatsapp-web.js')

import axios from 'axios'
import _ from 'lodash'
import mime from 'mime-types'
import dayjs from 'dayjs'
import sharp from 'sharp'

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

  if (msg.body === '!test' && msg.hasMedia) {
    const attachmentData = await msg.downloadMedia()
    console.log(attachmentData.filesize)
    compresImage(attachmentData)
      .then((x) => console.log(x.filesize))
      .catch((err) => console.log(err))
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
            .then(() => {
              let str = `Data berhasil disimpan`
              //     str += `data berhasil disimpan!
              // \nCara update data:
              // \n1. Quote genba diatas, dengan cara pesan digeser ke kanan,\n2.Tulis salah satu paramater dibawah beserta value parameternya,
              // \n\nKeterangan Parameter:
              // \nDept: u/ departement(2 digit),\nPlant: u/ plant company(GM1,GM2,GM3,GM5,GMX,GMU),\nArea: u/ area genba,\nMc: u/ kode mesin,\nCat: u/ category genba,\nCase: u/ temuan genba,\nR1: u/ nilai Ringas,\nR2: u/ nilai Rapi,\nR3: u/ nilai Resik,\nR4: u/ nilai Rawat,\nR5: u/ nilai Rajin
              // \n\ncontoh: \nDept: PD`
              msg.reply(str)
            })
            .catch((err) => msg.reply(err.message)),
        )
        .catch((err) => msg.reply(err.message))
    } else {
      msg.reply('Failed, format media bukan image/jpeg')
    }
  }

  if (
    msg.body.length > 1 &&
    msg.hasQuotedMsg &&
    msg._data.quotedMsg.type === 'image'
  ) {
    const keys = msg.body.substring(0, msg.body.indexOf(':'))
    const val = msg.body.slice(msg.body.indexOf(':') + 2)
    const quotedMsg = await msg.getQuotedMessage()
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

  if (
    msg.body == '!improvement' &&
    msg.hasQuotedMsg &&
    msg._data.quotedMsg.type === 'image' &&
    msg.hasMedia
  ) {
    const attachmentData = await msg.downloadMedia()
    const quotedMsg = await msg.getQuotedMessage()
    compresImage(attachmentData)
      .then((compressed) => {
        axios
          .post(`http://localhost:5000/genbaAcip/${quotedMsg.id.id}`, {
            close_date: dayjs(),
            images2: compressed,
          })
          .then(() => {
            msg.reply('Success, data berhasil disimpan')
          })
          .catch((err) => msg.reply(err.message))
      })
      .catch((err) => msg.reply(err.message))
  }

  if (
    msg.body == '!delete' &&
    msg.hasQuotedMsg &&
    msg._data.quotedMsg.type === 'image'
  ) {
    const quotedMsg = await msg.getQuotedMessage()
    await axios
      .delete(`http://localhost:5000/genbaAcipDel/${quotedMsg.id.id}`)
      .then((res) => {
        if (res.status == 200) {
          msg.reply(`Success, data sudah dihapus`)
        } else if (res.status == 404) {
          msg.reply(res.data)
        }
      })
      .catch((err) => {
        msg.reply(err.message)
      })
  }

  if (
    msg.body == '!remove improvement' &&
    msg.hasQuotedMsg &&
    msg._data.quotedMsg.type === 'image'
  ) {
    const quotedMsg = await msg.getQuotedMessage()
    await axios
      .post(`http://localhost:5000/genbaAcipRem/${quotedMsg.id.id}`)
      .then((res) => {
        if (res.status == 200) {
          msg.reply(`Success, image improvement sudah dihapus`)
        } else if (res.status == 404) {
          msg.reply(res.data)
        }
      })
      .catch((err) => {
        msg.reply(err.message)
      })
  }
})

export default WaClient
;(async () => {
  await WaClient.initialize()
})()
