// Playlist info
let playlistName, playlistId;
// List of all track names
// We don't need to use the Track class because we are only storing names
let tracks = [];

function loadTracks() {
  // Get playlist ID from URL parameters
  const params = new URLSearchParams(location.search);
  playlistName = params.get('name');
  playlistId = params.get('id');

  // Update playlist name area
  let playlistNameArea = document.getElementById('playlistName');
  playlistNameArea.value = playlistName;

  // Get playlist tracks from Spotify
  fetch(`http://localhost:3001/music/tracks?userToken=${user.token}&playlistId=${playlistId}`)
  .then(response => {
    return response.text();
  })
  .then(response => {
    const data = JSON.parse(response);

    // TODO - SOMETIMES RETURNS NULL TRACK
    for(const track of data) {
      // Some tracks return null
      if(track.track === null) { continue; }
      // Add track name to list of tracks
      tracks.push(track.track.name);
    }

    // Update facts for user
    let totalTracks = document.getElementById('totalTracks');
    totalTracks.innerHTML = tracks.length;
    let possibleSheets = document.getElementById('possibleSheets');
    possibleSheets.innerHTML = factorial(tracks.length);

    // Create track for each item
    let trackList = document.getElementById('trackList');
    trackList.innerHTML = '';
    for(let i = 0; i < tracks.length; i++) {
      let ti = createTrack(tracks[i], i);

      trackList.appendChild(ti);
    }
  });
}

function createTrack(track, index) {
  // Create track container
  let trackContainer = document.createElement('div');
  trackContainer.classList.add('box');
  trackContainer.classList.add('box-full');
  trackContainer.classList.add('box-small');

  // Create track item
  let trackItem = document.createElement('input');
  trackItem.id = `track${index}`;
  trackItem.value = track;
  trackItem.classList.add('input');

  // Add track item to container
  trackContainer.appendChild(trackItem);

  return trackContainer;
}

function factorial(n) {
  function factorialHelper(n) {
    if(n === 0) {
      return 1;
    } else {
      return n * factorialHelper(n-1);
    }
  }

  return factorialHelper(n);
}

function generate() {
  // Collect playlist title
  let title = document.getElementById('playlistName').value;
  if(title.split(' ').join('').length < 1) {
    alert('Playlist title must be at least one letter');
    return;
  }

  // Collect track names
  let trackNames = [];
  for(let i = 0; i < tracks.length; i++) {
    let track = document.getElementById(`track${i}`).value;
    if(track.split(' ').join('').length < 1) {
      alert('At least one track is missing a name');
      return;
    } else {
      trackNames.push(track);
    }
  }

  // Convert track name array to JSON string
  let jsonTracks = JSON.stringify(trackNames);

  // Create search parameters and send to generator
  let params = new URLSearchParams();
  params.append('title', title);
  params.append('tracks', jsonTracks);

  window.location.href = `/generate?${params.toString()}`;
}