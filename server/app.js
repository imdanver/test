import express from 'express'
const app = express()
import bodyParser from 'body-parser'
import cors from 'cors'
import router from './routes/router.js'

app.use(bodyParser.json({
    parameterLimit: 100000,
    limit: '5mb',
    extended: true
}))

app.use(bodyParser.urlencoded({limit: '5mb', extended: true}))

app.use(cors())

app.use(router)

app.use('/', express.static('../client/dist'))

export default app
