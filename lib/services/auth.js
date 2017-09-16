const SpotifyWebApi = require('spotify-web-api-node')
const redirectUri = process.env.REDIRECT_URI
const clientSecret = process.env.CLIENT_SECRET
const clientId = process.env.CLIENT_ID

async function getTokens (code) {
  const spotifyApi = new SpotifyWebApi({
    clientId,
    clientSecret,
    redirectUri
  })

  return spotifyApi.authorizationCodeGrant(code)
    .then(function(data) {
      return {
        accessToken: data.body['access_token'],
        refreshToken: data.body['refresh_token']
      }
    })
    .catch(error => { throw new Error(error) })
}

async function getLoginUrl () {
  const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public']
  const spotifyApi = new SpotifyWebApi({
    redirectUri,
    clientId
  })
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes)
  return spotifyApi.createAuthorizeURL(scopes)
}

async function test () {
  return process.env.TEST
}

module.exports = {
  getLoginUrl,
  getTokens,
  test
}
