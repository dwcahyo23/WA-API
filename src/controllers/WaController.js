import pkg from 'whatsapp-web.js'
import { validationResult } from 'express-validator'
import axios from 'axios'
import WaClient from '../config/WaConfig.js'
import phoneNumberFormatter from '../helper/formatter.js'
import numberPhone from '../helper/numberphone.js'

const { MessageMedia } = pkg

const checkRegisterNumber = async (number) => {
  const isRegistered = await WaClient.isRegisteredUser(number)
  return isRegistered
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

export default {
  async SendMsg(req, res) {
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
  },

  async SendMsgMedia(req, res) {
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
  },

  async ClearMsg(req, res) {
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
  },

  async SendMsgGroup(req, res) {
    const errors = validationResult(req).formatWith(({ msg }) => msg)
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: errors.mapped(),
      })
    }
    const { message, name, id } = req.body
    let chatId

    if (!id) {
      const group = await FindGroupByName(name)
      if (!group) {
        return res.status(422).json({
          status: false,
          message: 'No group found with name: ' + name,
        })
      }
      chatId = group.id._serialized
    }

    WaClient.sendMessage(chatId, message)
      .then((response) => {
        res.status(200).json({ status: true, response: response })
      })
      .catch((err) => {
        res.status(500).json({ status: false, response: err })
      })
  },

  async SendMsgGroupAndMentions(req, res) {
    const errors = validationResult(req).formatWith(({ msg }) => msg)
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: errors.mapped(),
      })
    }
    const { message, name, id, mentions } = req.body
    let chatId

    if (!id) {
      const group = await FindGroupByName(name)
      if (!group) {
        return res.status(422).json({
          status: false,
          message: 'No group found with name: ' + name,
        })
      }
      chatId = group.id._serialized
    }
    let Chat = WaClient.getChatById(chatId)

    const contact = phoneNumberFormatter(mentions)

    const number = numberPhone(mentions)

    Chat.then((x) =>
      x
        .sendMessage(`${message} @${number}`, { mentions: [contact] })
        .then((response) =>
          res
            .status(200)
            .json({
              status: true,
              response: response,
              log: `${message} @${number}, ${contact}`,
            }),
        )
        .catch((err) => res.status(500).json({ status: false, response: err })),
    )

    // WaClient.sendMessage(chatId, message)
    //   .then((response) => {
    //     res.status(200).json({ status: true, response: response })
    //   })
    //   .catch((err) => {
    //     res.status(500).json({ status: false, response: err })
    //   })
  },

  async Chats(req, res) {
    try {
      const chats = await WaClient.getChats()
      const phoneNumbers = chats.map((chat) => chat.id._serialized)

      res.status(200).json({
        status: true,
        message: 'List of chat phone numbers',
        phoneNumbers: phoneNumbers,
      })
    } catch (err) {
      console.error('Failed to fetch chats:', err)
      res.status(500).json({
        status: false,
        message: 'Failed to fetch chats',
        error: err.message,
      })
    }
  },
}
