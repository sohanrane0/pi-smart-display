require('dotenv').config()
const express = require('express')
const axios = require('axios')
const app = express()
const port = 3000

app.use(express.static('dashboard'))

const SCOPES = 'user-read-playback-state user-read-currently-playing user-modify-playback-state'

app.get('/login', (req, res) => {
  const url = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: SCOPES
  })
  res.redirect(url)
})

app.get('/callback', async (req, res) => {
  const code = req.query.code
  const response = await axios.post('https://accounts.spotify.com/api/token',
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    }), {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  
  app.locals.accessToken = response.data.access_token
  app.locals.refreshToken = response.data.refresh_token
  res.redirect('/')
})

app.get('/now-playing', async (req, res) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 'Authorization': `Bearer ${app.locals.accessToken}` }
    })
    if (response.status === 204) return res.json({ playing: false })
    res.json({ playing: true, ...response.data })
  } catch (err) {
    res.json({ playing: false })
  }
})
app.post('/player/:action', async (req, res) => {
  const { action } = req.params
  try {
    if (action === 'play' || action === 'pause') {
      await axios.put(`https://api.spotify.com/v1/me/player/${action}`, {}, {
        headers: { 'Authorization': `Bearer ${app.locals.accessToken}` }
      })
    } else {
      await axios.post(`https://api.spotify.com/v1/me/player/${action}`, {}, {
        headers: { 'Authorization': `Bearer ${app.locals.accessToken}` }
      })
    }
    res.json({ ok: true })
  } catch (err) {
    res.json({ ok: false })
  }
})

app.post('/player/volume', async (req, res) => {
  const vol = req.query.val
  try {
    await axios.put(`https://api.spotify.com/v1/me/player/volume?volume_percent=${vol}`, {}, {
      headers: { 'Authorization': `Bearer ${app.locals.accessToken}` }
    })
    res.json({ ok: true })
  } catch (err) {
    res.json({ ok: false })
  }
})
app.post('/player/:action', async (req, res) => {
  const { action } = req.params
  try {
    if (action === 'play' || action === 'pause') {
      await axios.put(`https://api.spotify.com/v1/me/player/${action}`, {}, {
        headers: { 'Authorization': `Bearer ${app.locals.accessToken}` }
      })
    } else {
      await axios.post(`https://api.spotify.com/v1/me/player/${action}`, {}, {
        headers: { 'Authorization': `Bearer ${app.locals.accessToken}` }
      })
    }
    res.json({ ok: true })
  } catch (err) {
    console.log('Spotify error:', err.response?.status, err.response?.data)
    res.json({ ok: false })
  }
})
app.listen(port, () => {
  console.log(`Dashboard running at http://localhost:${port}`)
})