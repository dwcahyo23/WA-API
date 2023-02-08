import pkg from 'whatsapp-web.js'
import { validationResult } from 'express-validator'
import axios from 'axios'
import WaClient from '../config/WaConfig.js'
import phoneNumberFormatter from '../helper/formatter.js'

const { MessageMedia } = pkg

const checkRegisterNumber = async (number) => {
  const isRegistered = await WaClient.isRegisteredUser(number)
  return isRegistered
}

export const SendMsg = async (req, res) => {
  const errors = validationResult(req).formatWith(({ msg }) => msg)

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped(),
    })
  }

  const number = phoneNumberFormatter(req.body.number)
  const { message } = req.body

  const isRegisteredNumber = await checkRegisterNumber(number)

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registerd',
    })
  }

  WaClient.sendMessage(number, message)
    .then((response) => {
      res.status(200).json({
        status: true,
        response,
      })
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        response: err,
      })
    })
}

export const SendMsgMedia = async (req, res) => {
  const errors = validationResult(req).formatWith(({ msg }) => msg)

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped(),
    })
  }
  const number = phoneNumberFormatter(req.body.number)
  const { caption, fileUrl } = req.body

  let mimetype
  const attachment = await axios
    .get(fileUrl, {
      responseType: 'arraybuffer',
    })
    .then((response) => {
      mimetype = response.headers['content-type']
      return response.data.toString('base64')
    })

  const media = new MessageMedia(mimetype, attachment, 'Media')

  WaClient.sendMessage(number, media, {
    caption,
  }).then((response) => {
    res
      .status(200)
      .json({
        status: true,
        response,
      })
      .catch((err) => {
        res.status(500).json({
          status: false,
          response: err,
        })
      })
  })
}

export const ClearMsg = async (req, res) => {
  const errors = validationResult(req).formatWith(({ msg }) => msg)

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped(),
    })
  }

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped(),
    })
  }

  const number = phoneNumberFormatter(req.body.number)

  const isRegisteredNumber = await checkRegisterNumber(number)

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not resgitered',
    })
  }

  const chat = await WaClient.getChatById(number)

  chat
    .clearMessages()
    .then((status) => {
      res.status(200).json({
        status: true,
        response: status,
      })
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        response: err,
      })
    })
}

const FindGroupByName = async (name) => {
  const group = await WaClient.getChats().then((chats) =>
    chats.find(
      (chat) =>
        chat.isGroup &&
        chat.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    ),
  )
  return group
}
