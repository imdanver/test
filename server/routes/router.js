import express from 'express'
const router = express.Router()
const jsonParser = express.json()
import ajax from '../controllers/controller.js'

router.get('/ajax', ajax)
router.post('/ajax', jsonParser, ajax)

export default router