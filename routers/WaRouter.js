import expres from 'express';
import { body } from 'express-validator';
import { SendMsg } from '../controllers/WaController.js';

const router = expres.Router();

router.post('/send-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
], SendMsg);

export default router;
