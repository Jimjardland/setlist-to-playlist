const createPlaylist = require('./lib/services/createPlaylist')
const auth = require('./lib/services/auth')
const express = require('express')
const http = require('http')
const path = require('path')
const router = express.Router()
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/api', router)
app.use('/', express.static('client'))
app.get('/', async (req, res) => res.redirect(await auth.getLoginUrl()))
app.get('/create', (req, res) => res.sendFile(path.resolve('index.html')))

router.post('/create-playlist', async (req, res, next) => {
  createPlaylist(req.body.artist, req.body.token)
    .then(message => res.send({ message }))
    .catch(error => res.status(400).send({ message: error.message }))
})

router.post('/auth', async (req, res, next) => {
  const tokens = await auth.getTokens(req.body.code)
  res.send(tokens)
})

const server = http.createServer(app)
const PORT = process.env.PORT || 8888
server.listen(PORT, () => {
	console.log(`listening on ${PORT}`)
})