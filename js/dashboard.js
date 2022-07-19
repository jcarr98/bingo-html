// Using { Playlist, Track, User } from ../classes/datastores.js

// List of all current playlists
let playlists = [];
// Index of current playlist and list of all tracks of currently selected playlist
let playlist = -1, tracks = [];
// Count of all sample buttons for this playlist and currently selected sample button
let currentButton = -1, buttonCount = 0;
let a;

function loadEverything() {
  // Load saved prefernce settings
  loadSettings();
  // Validate user token
  validateUser();
  // Load user information from Spotify
  loadUserInfo();
  // Load all user playlists from Spotify
  loadPlaylists();
}

function loadUserInfo() {
  // Fetch data
  fetch(`http://localhost:3001/music/me?userToken=${user.token}`)
  .then(response => {
    return response.text();
  })
  .then(response => {
    let data = JSON.parse(response);

    // `user` is a global variable loaded from ./shared.js
    user.name = data.display_name;
    user.href = data.href;
    user.id = data.id;

    // Set user name
    let usernameArea = document.getElementById('usernameArea');
    usernameArea.innerHTML = user.name;
  });
}

function loadPlaylists() {
  fetch(`http://localhost:3001/music/playlists?userToken=${user.token}`)
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

      let playlist = new Playlist(
        element.id,
        element.name,
        element.description,
        element.tracks.total
      );

      playlists.push(playlist);
    }

    // Show table
    let table = document.getElementById('playlistList');
    table.style.visibility = 'visible';

    // Remove loading text
    let loadingText = document.getElementById('loadingText');
    loadingText.remove();

    // Create element for each playlist
    for(let i = 0; i < playlists.length; i++) {
      let playlist = playlists[i];

      let tableRow = document.createElement('tr');
      tableRow.classList.add('table-clickable');
      tableRow.onclick = function() { loadTracks(i); };

      let playlistName = document.createElement('td');
      playlistName.innerHTML = playlist.name;

      let numTracks = document.createElement('td');
      numTracks.innerHTML = playlist.number_tracks;

      tableRow.appendChild(playlistName);
      tableRow.appendChild(numTracks);

      table.appendChild(tableRow);
    }
  });
}

/* Tracks code */
function loadTracks(index) {
  // Update currently selected playlist
  playlist = index;

  // Get all necessary html elements
  let playlistNameArea = document.getElementById('playlistName');
  let playlistDescArea = document.getElementById('playlistDescription');
  let trackArea = document.getElementById('trackArea');
  let createButton = document.getElementById('createButton');

  // Set loading text
  playlistDescArea.innerHTML = 'Loading...';

  // Get all tracks from the specified playlist
  fetch(`http://localhost:3001/music/tracks?userToken=${user.token}&playlistId=${playlists[index].id}`)
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

    // Enable creation button
    createButton.disabled = false;

    // Clear current track list
    tracks = [];

    // Save each track with wanted data
    for(const element of data) {
      const el = element.track;

      // Create track object
      let track = new Track(
        el.name,
        el.artists,
        el.album.name,
        el.album.images[2].url,
        el.preview_url
      );

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
  infoContainer.style.flexWrap = 'nowrap';

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
  artists.innerHTML = track.artist_string();

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

function createSheets() {
  // Send user to create page with currently selected playlist
  const currentPlaylist = playlists[playlist];
  window.location.href = `/create?playlist=${currentPlaylist.id}`;
}

function logout() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
  window.location.href = '/';
}