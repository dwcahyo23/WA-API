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

  if(msg.body === 'ok' || msg.body === 'Ok' || msg.body === 'OK' && msg.hasQuotedMsg){
    const quoteMsg = await msg.getQuotedMessage()
    // console.log(quoteMsg.body.substring(0, 11))
    // msg.reply(quoteMsg.from.split('@').at(0))
    // msg.reply(quoteMsg.body.substring(0, 11))
    const data = {
       sheet_no :quoteMsg.body.substring(0, 11),
       isResponse : 'Y',
       responseBy: quoteMsg.from.split('@').at(0),
       responseDate : dayjs()
    }
    axios.post('http://localhost:5000/posRespon', data)
    .then((x) =>{ 
      const diff = dayjs(data.responseDate).diff(dayjs(x.data.createdAt), 'hour', true).toFixed(2)
      
      msg.reply(`response success, ${data.sheet_no} ${diff} hours`)} )
    .catch((err) => msg.reply(`response failed, ${data.sheet_no}`))
  }

  if (msg.hasQuotedMsg) {  
    const quotedMsg = await msg.getQuotedMessage()
    const textBody = quotedMsg.body
    const sheet_no = textBody.substring(
      quotedMsg.body.search('AP-'),
      quotedMsg.body.search('AP-') + 11,
    )
    const close = quotedMsg.body.includes('(Close)')
    const checklist = quotedMsg.body.includes('✅')

    const result = msg.body.split(',').map((x) => x * 1)
    
    if (
      close && checklist
    ) {
      const score = _.mean(result) * 1
      _.isNaN(score) || score > 5 || result.length > 3
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
            .catch((err) => {
              console.log(err)
            })
    }
  }

  if(msg.body){
    const body = msg.body
    if(body.includes('resume wo') || body.includes('Resume Wo')){
      let com = ''
      switch (true) {
        case body.includes('gm1'):
        case body.includes('GM1'):
        case body.includes('Gm1'):
            com += '01,'          
          break;
        case body.includes('gm2'):
        case body.includes('GM2'):
        case body.includes('Gm2'):
            com += '02,'          
          break;
        case body.includes('gm3'):
        case body.includes('GM3'):
        case body.includes('Gm3'):
            com += '03,'          
           break;
        case body.includes('gm5'):
        case body.includes('GM5'):
        case body.includes('Gm5'):
             com += '06,'          
          break;
      
        default:
          com += '01,02,03,06'
          break;
      }


      axios.get(`http://localhost:5000/getResumeErpMonth/${com}`)
      .then((x) => {

        const res = _.chain(x.data).groupBy('com').map((val, key) => ({key, val})).value()

        let msgReply = `*Resume Work Order* ${dayjs().format('MMM')}:`
        _.forEach(res, (x) => {
          msgReply += `\n ${x.key}:`
          _.forEach(x.val, (y) => {
            msgReply += `\n- ${y.prio}: (Close: ${y.close}, Open: ${y.open})`
          })
        })
        msgReply += `\n\n access_date: ${dayjs().format('DD-MM-YYYY HH:mm')}`
        msg.reply(msgReply)
      })
      .catch((err) => console.log(err))
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
