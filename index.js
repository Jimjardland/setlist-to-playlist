const createPlaylist = require('./lib/services/createPlaylist')
const auth = require('./lib/services/auth')
const express = require('express')
const http = require('http')
const path = require('path')
const router = express.Router()
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use('/api', router)
app.use('/', express.static('client'));
app.get('/', async (req, res) => res.redirect(await auth.getLoginUrl()))
app.get('/callback', (req, res) => res.sendFile(path.resolve('index.html')))

router.post('/create-playlist', async (req, res, next) => {
  createPlaylist(req.body.artist, req.body.token)
    .then(message => res.send({ message }))
    .catch(error => {
      error.statusCode = 400
      res.send({ message: error.message })
    })
  
})


const server = http.createServer(app)
const PORT = process.env.PORT || 8888
server.listen(PORT, () => {
	console.log(`listening on ${PORT}`)
})