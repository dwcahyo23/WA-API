import expres from 'express'
import { body } from 'express-validator'
import WaController from '../controllers/WaController'

export default (app) => {
  app.post(
    '/send-message',
    [body('number').notEmpty(), body('message').notEmpty()],
    WaController.SendMsg,
  )

  app.post(
    '/send-message-group',
    [
      body('id').custom((value, { req }) => {
        if (!value && !req.body.name) {
          throw new Error('Invalid value, you can use `id` or `name`')
        }
        return true
      }),
      body('message').notEmpty(),
    ],
    WaController.SendMsgGroup,
  )

  app.get('/getchat', WaController.Chats)

  // app.post(
  //   '/send-message-group-mentions',
  //   [
  //     body('id').custom((value, { req }) => {
  //       if (!value && !req.body.name) {
  //         throw new Error('Invalid value, you can use `id` or `name`')
  //       }
  //       return true
  //     }),
  //     body('message').notEmpty(),
  //   ],
  //   WaController.SendMsgGroupMentions,
  // )
}
