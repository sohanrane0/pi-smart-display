let isPlaying = false

async function fetchNowPlaying() {
  try {
    const res = await fetch('/now-playing')
    const data = await res.json()

    if (data.playing && data.item) {
      const artUrl = data.item.album.images[0].url
      document.getElementById('track-name').textContent = data.item.name
      document.getElementById('artist-name').textContent = data.item.artists.map(a => a.name).join(', ')
      document.getElementById('album-img').src = data.item.album.images[1].url
      document.getElementById('bg-blur').style.backgroundImage = `url(${artUrl})`
      document.getElementById('volume-slider').value = data.device?.volume_percent ?? 50
      isPlaying = data.is_playing
      document.getElementById('play-btn').textContent = isPlaying ? '⏸' : '▶'
    } else {
      document.getElementById('track-name').textContent = 'Nothing playing'
      document.getElementById('artist-name').textContent = ''
      document.getElementById('album-img').src = ''
      document.getElementById('bg-blur').style.backgroundImage = ''
    }
  } catch (err) {
    console.error(err)
  }
}

async function spotifyAction(action) {
  console.log('spotifyAction called:', action)
  await fetch(`/player/${action}`, { method: 'POST' })
  setTimeout(fetchNowPlaying, 500)
}

async function togglePlay() {
  console.log('togglePlay called, isPlaying:', isPlaying)
  const action = isPlaying ? 'pause' : 'play'
  await fetch(`/player/${action}`, { method: 'POST' })
  setTimeout(fetchNowPlaying, 500)
}

async function setVolume(val) {
  await fetch(`/player/volume?val=${val}`, { method: 'POST' })
}

fetchNowPlaying()
setInterval(fetchNowPlaying, 5000)