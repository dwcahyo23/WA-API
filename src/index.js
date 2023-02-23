/* eslint-disable import/no-extraneous-dependencies */
import express from 'express'
import { Server } from 'socket.io'
import qrcode from 'qrcode'
import { createServer } from 'http'
import * as dotenv from 'dotenv'
import cors from 'cors'
import logger from 'morgan'
import WaClient from './config/WaConfig'
import WaRouter from './routers/WaRouter'
import path from 'path'
import _ from 'lodash'

dotenv.config()

const port = process.env.PORT
const app = express()
app.use(logger('dev'))
const httpServer = createServer(app)
const io = new Server(httpServer)

app.use(cors())
app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  }),
)
app.use(WaRouter)

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: path.join(__dirname, '../public'),
  })
})

io.on('connection', (socket) => {
  socket.emit('message', 'Connecting...')

  WaClient.on('loading_screen', (percent, message) => {
    socket.emit('message', `LOADING SCREEN ${percent} ${message}`)
    console.log('LOADING SCREEN', percent, message)
  })

  WaClient.on('qr', (qr) => {
    console.log('QR RECEIVED', qr)
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url)
      socket.emit('message', 'QR code received, scan please!')
    })
  })

  WaClient.on('ready', () => {
    socket.emit('ready', 'Whatsapp is ready!')
    socket.emit('message', 'Whatsapp is ready!')
  })

  WaClient.on('authenticated', () => {
    socket.emit('authenticated', 'Whatsapp is authenticated!')
    socket.emit('message', 'Whatsapp is authenticated')
    console.log('AUTHENTICATED')
  })

  WaClient.on('auth_failure', () => {
    socket.emit('message', 'Auth failure, restartig..')
  })

  WaClient.on('disconnected', (reason) => {
    socket.emit('message', `Whatsapp is disconnected! ${reason}`)
    WaClient.destroy()
    WaClient.initialize()
  })

  WaClient.on('message', async (msg) => {
    socket.emit('message', `raw: ${JSON.stringify(msg.rawData)}`)
  })
})

httpServer.listen(port, () => {
  console.log(`Server up & running in ${port}`)
})
