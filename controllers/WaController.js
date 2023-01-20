import { validationResult } from 'express-validator';
import phoneNumberFormatter from '../helper/formatter.js';
import WaClient from '../config/WaConfig.js';

WaClient.on('message', (msg) => {
  if (msg.body === '!ping') {
    msg.reply('pong');
  }
});

const checkRegisterNumber = async (number) => {
  const isRegistered = await WaClient.isRegisteredUser(number);
  return isRegistered;
};

export const SendMsg = async (req, res) => {
  const erros = validationResult(req).formatWith(({
    msg,
  }) => msg);

  if (!erros.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: erros.mapped(),
    });
  }

  const number = phoneNumberFormatter(req.body.number);
  const { message } = req.body;

  const isRegisteredNumber = await checkRegisterNumber(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registerd',
    });
  }

  WaClient.sendMessage(number, message)
    .then((response) => {
      res.status(200).json({
        status: true,
        response,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        response: err,
      });
    });
};
