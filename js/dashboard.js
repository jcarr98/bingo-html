let user = {
  'name': null,
  'href': null,
  'id': null
};

let playlists = [], tracks = [], sampleButtons = [];
let currentButton = -1, buttonCount = 0;
let a;

function loadEverything() {
  loadSettings();
  validateUser();
  loadUserInfo();
  loadPlaylists();
}

function validateUser() {
  // Check if user has token
  const userToken = localStorage.getItem('userToken');
  if(userToken === null) {
    window.location.replace('/login');
    return;
  }

  // If user has token, check for expiry time
  const expiryTime = parseInt(localStorage.getItem('tokenExpiry'));
  
  // If no expiry is present or token is expired, send user to login page
  // Otherwise, let them continue
  const currentTime = Date.now();
  if(expiryTime === null || isNaN(expiryTime) || currentTime > expiryTime) {
    window.location.replace('/login');
  }
}

function loadUserInfo() {
  console.log('loading info');
  // Get user token
  let userToken = localStorage.getItem('userToken');

  // Check it exists
  if(userToken === null) {
    window.location.href = '/login';
    return;
  }

  // Fetch data
  fetch(`http://localhost:3001/music/me?userToken=${userToken}`)
  .then(response => {
    return response.text();
  })
  .then(response => {
    let data = JSON.parse(response);

    user.name = data.display_name;
    user.href = data.href;
    user.id = data.id;

    // Set user name
    let usernameArea = document.getElementById('usernameArea');
    usernameArea.innerHTML = user.name;
  });
}

function loadPlaylists() {
  const accessToken = localStorage.getItem('userToken');

  fetch(`http://localhost:3001/music/playlists?userToken=${accessToken}`)
  .then(response => {
    return response.text();
  })
  .then(response => {
    let data = JSON.parse(response);

    // Load each playlist
    for(const element of data) {
      // Only add playlist that have >= 25 songs
      if(element.tracks.total < 25) {
        continue;
      }

      let playlist = {
        id: element.id,
        name: element.name,
        description: element.description,
        numTracks: element.tracks.total
      };

      playlists.push(playlist);
    }

    // Create element for each playlist
    let loadingText = document.getElementById('loadingText');
    let table = document.getElementById('playlistList');
    table.style.visibility = 'visible';
    loadingText.remove();
    for(let i = 0; i < playlists.length; i++) {
      let playlist = playlists[i];

      let tableRow = document.createElement('tr');
      tableRow.classList.add('table-clickable');
      tableRow.onclick = function() { loadTracks(i) };

      let playlistName = document.createElement('td');
      playlistName.innerHTML = playlist.name;

      let numTracks = document.createElement('td');
      numTracks.innerHTML = playlist.numTracks;

      tableRow.appendChild(playlistName);
      tableRow.appendChild(numTracks);

      table.appendChild(tableRow);
    }

    console.log('Done loading');
  });
}

function loadTracks(index) {
  const accessToken = localStorage.getItem('userToken');
  let playlistNameArea = document.getElementById('playlistName');
  let playlistDescArea = document.getElementById('playlistDescription');
  let trackArea = document.getElementById('trackArea');

  // Set loading text
  playlistDescArea.innerHTML = 'Loading...';

  // Get all tracks from the specified playlist
  fetch(`http://localhost:3001/music/tracks?userToken=${accessToken}&playlistId=${playlists[index].id}`)
  .then(response => {
    return response.text();
  })
  .then(response => {
    let data = JSON.parse(response);

    // Set playlist name and description
    playlistNameArea.innerHTML = playlists[index].name;
    playlistDescArea.innerHTML = playlists[index].description;

    // Set track area to visible
    trackArea.style.visibility = 'visible';

    // Clear current track list
    tracks = [];

    // Save each track with wanted data
    for(const element of data) {
      const el = element.track;
      let artists = [];

      // Separate out only artist names
      for(const artist of el.artists) {
        artists.push(artist.name);
      }

      // Create track object
      let track = {
        name: el.name,
        artists: artists,
        album: el.album.name,
        album_art: el.album.images[2].url,
        preview: el.preview_url
      }

      // Save track object to master list
      tracks.push(track);
    }

    // Create track nodes
    let trackListArea = document.getElementById('trackList');
    // Clear child nodes
    while(trackListArea.firstChild) {
      trackListArea.removeChild(trackListArea.firstChild);
    }

    for(const track of tracks) {
      // Create track card
      let trackCard = createCard(track);

      // Add to list of all tracks
      trackListArea.appendChild(trackCard);
    }
  })
}

function createCard(track) {
  // Create card div
  let card = document.createElement('div');
  card.classList.add('card');
  card.classList.add('card-wide');
  card.style.minHeight = '125px';

  // Info container
  let infoContainer = document.createElement('div');
  infoContainer.classList.add('box');
  infoContainer.classList.add('box-full');
  infoContainer.style.justifyContent = 'flex-start';

  // Album container
  let albumContainer = document.createElement('div');
  albumContainer.classList.add('box');
  albumContainer.classList.add('box-small');

  // Album cover
  let albumCover = document.createElement('img');
  albumCover.src = track.album_art;

  // Add album to album container
  albumContainer.appendChild(albumCover);

  // Track container
  let trackContainer = document.createElement('div');
  trackContainer.classList.add('box');
  trackContainer.classList.add('box-vertical');
  trackContainer.classList.add('box-small');
  trackContainer.style.alignItems = 'flex-start';

  // Track title
  let title = document.createElement('div');
  title.style.fontSize = '1.4em';
  title.innerHTML = track.name;

  // Artists
  let artists = document.createElement('div');
  artists.innerHTML = artistList(track.artists);

  // Add track info to track container
  trackContainer.appendChild(title);
  trackContainer.appendChild(artists);

  // Add track info to container
  infoContainer.appendChild(albumContainer);
  infoContainer.appendChild(trackContainer);

  // Add everything to card
  card.appendChild(infoContainer);

  // Add card footer with link to preview
  let footer = document.createElement('div');
  // footer.classList.add('card-footer');
  footer.classList.add('box');
  footer.classList.add('box-full');
  footer.style.paddingTop = '1em';
  footer.style.justifyContent = 'flex-start';

  // Sample button
  let sample = document.createElement('button');
  sample.classList.add('btn');
  sample.id = `${buttonCount}`;
  sample.innerHTML = 'Play sample';
  if(track.preview == null) {
    sample.disabled = true;
  } else {
    sample.onclick = () => { toggleSample(sample.id, track.preview) };
  }
  buttonCount++;

  // Add sample button to footer
  footer.appendChild(sample);

  // Add footer to card
  card.appendChild(footer);

  // Return completed card
  return card;
}

function artistList(artists) {
  let str = 'By: ';

  for(let i = 0; i < artists.length; i++) {
    str = str + artists[i];

    if(i < artists.length-1) {
      str = str + ', ';
    }
  }

  return str;
}

function toggleSample(index, url) {
  // Check if audio is already playing
  if(currentButton >= 0) {
    // Pause audio
    a.pause();

    // Change current button's text
    let btn = document.getElementById(`${currentButton}`);
    btn.innerHTML = 'Play Sample';
  }

  // Check if clicked button was already playing
  if(index === currentButton) {
    // If clicked button was already playing, don't play audio again
    // And change currentButton to -1
    currentButton = -1;
    return;
  }

  a = new Audio(url);

  if(a.error) {
    console.log(audio.error);
    alert('Error playing audio');
  } else {
    // Play audio
    a.play();

    // Change button text
    let newBtn = document.getElementById(`${index}`);
    currentButton = index;
    newBtn.innerHTML = 'Pause sample';
  }

}

function logout() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
  window.location.href = '/';
}