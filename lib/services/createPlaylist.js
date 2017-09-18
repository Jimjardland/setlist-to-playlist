const SpotifyWebApi = require('spotify-web-api-node')
const pMap = require('p-map')
const fetch = require('node-fetch')
const auth = require('./auth')
const redirectUri = process.env.REDIRECT_URI
const clientSecret = process.env.CLIENT_SECRET
const clientId = process.env.CLIENT_ID
const setlistKey = process.env.SET_LIST_KEY

let spotifyApi

const myInit = { method: 'GET',
               headers: { 'x-api-key': setlistKey, 'Accept': 'application/json' },
               mode: 'cors',
               cache: 'default' }


async function init (accessToken) {
  spotifyApi = new SpotifyWebApi({
    clientId,
    clientSecret,
    redirectUri,
    accessToken
  })
}

async function searchArtist (artist) {
  return fetch(`https://api.setlist.fm/rest/1.0/search/artists?artistName=${artist}&p=1&sort=relevance`, myInit)
    .then(res => res.json())
    .then(artists => artists.artist[0])
    .catch(error => { throw new Error(error) })
 }


async function getSetlistForArtist (id) {
  if(!id) throw new Error('could not find artist')
  return fetch(`https://api.setlist.fm/rest/1.0/artist/${id}/setlists?p=1`, myInit)
    .then(res => res.json())
    .then(setlists => setlists.setlist[0])
    .catch(error => { throw new Error(error) })
}

async function getSongId (artist, track) {
  return spotifyApi.searchTracks(`track:${track} artist:${artist}`, { limit: 1 })
    .then(({body}) => body)
    .catch(error => { throw new Error(error) })
}

async function getSongs (artist, tracks) {
  const searchHits = await pMap(tracks, ({ name: track }) => getSongId(artist, track))

  return searchHits.map(({ tracks }) => {
    return tracks.items.map(({ uri }) => uri)
  })

}

async function createPlaylist (user, name) {
  return spotifyApi.createPlaylist(user, `${name} - setlisttoplaylist.com`, { 'public' : false })
    .then(({body}) => body)
    .catch(error => { throw new Error(error) })
}


async function addSongsToPlayList (user, playlistId, songs) {
  return spotifyApi.addTracksToPlaylist(user, playlistId, songs)
    .catch(error => { throw new Error(error) })
}

async function getUsernameFromToken () {
  return spotifyApi.getMe()
}


async function createPlaylistFromArtist (artistName, accessToken) {
  await init(accessToken)
  const { mbid } = await searchArtist(artistName)
  const { body: { id: username }} = await getUsernameFromToken()
  const { sets: { set: [firstSet] }} = await getSetlistForArtist(mbid)
  const { id: playlistId, external_urls: { spotify: spotifyUrl } } = await createPlaylist(username, artistName)
  if(!firstSet) throw new Error('could not find songs from last set')
  const songs = await getSongs(artistName, firstSet.song)
  await addSongsToPlayList(username, playlistId, [].concat(...songs))
  
  return 'Success'
}

module.exports = createPlaylistFromArtist
