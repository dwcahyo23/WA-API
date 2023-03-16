import expres from 'express'
import { body } from 'express-validator'
import { SendMsg, SendMsgGroup } from '../controllers/WaController.js'

const router = expres.Router()

router.post(
  '/send-message',
  [body('number').notEmpty(), body('message').notEmpty()],
  SendMsg,
)

router.post(
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
  SendMsgGroup,
)

export default router
