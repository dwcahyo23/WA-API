/* eslint-disable import/no-extraneous-dependencies */
import express from 'express';
import { Server } from 'socket.io';
import qrcode from 'qrcode';
import { createServer } from 'http';
import * as dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import WaClient from './config/WaConfig.js';
import WaRouter from './routers/WaRouter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(WaRouter);
app.use(express.urlencoded({
  extended: true,
}));

app.use(fileUpload({
  debug: false,
}));

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname,
  });
});

(async () => {
  WaClient.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
  });
  await WaClient.initialize();
})();

io.on('connection', (socket) => {
  socket.emit('message', 'Connecting...');
  WaClient.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'QR code received, scan please!');
    });
  });

  WaClient.on('ready', () => {
    console.log('Whatsapp Ready');
    socket.emit('ready', 'Whatsapp is ready!');
    socket.emit('message', 'Whatsapp is ready!');
  });

  WaClient.on('authenticated', () => {
    socket.emit('authenticated', 'Whatsapp is authenticated!');
    socket.emit('message', 'Whatsapp is authenticated');
    console.log('AUTHENTICATED');
  });

  WaClient.on('auth_failure', () => {
    socket.emit('message', 'Auth failure, restartig..');
  });

  WaClient.on('disconnected', () => {
    socket.emit('message', 'Whatsapp is disconnected!');
    WaClient.destroy();
    WaClient.initialize();
  });
});

httpServer.listen(port, () => {
  console.log(`Server up & running in ${port}`);
});
