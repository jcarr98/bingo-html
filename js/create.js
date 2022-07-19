// List of all track names
// We don't need to use the Track class because we are only storing names
let tracks = [];

function loadTracks() {
  // Get playlist ID from URL parameters
  const params = new URLSearchParams(location.search);
  let playlistId = params.get('playlist');

  // Get playlist tracks from Spotify
  fetch(`http://localhost:3001/music/tracks?userToken=${user.token}&playlistId=${playlistId}`)
  .then(response => {
    return response.text();
  })
  .then(response => {
    const data = JSON.parse(response);
    console.log(data);

    // Update facts for user
    let totalTracks = document.getElementById('totalTracks');
    totalTracks.innerHTML = data.length;
    let possibleSheets = document.getElementById('possibleSheets');
    possibleSheets.innerHTML = factorial(data.length);

    for(const track of data) {
      tracks.push(track.track.name);
    }

    let trackList = document.getElementById('trackList');
    trackList.innerHTML = '';
    for(const track of tracks) {
      let li = document.createElement('li');
      li.innerHTML = track;

      trackList.appendChild(li);
    }
  });
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