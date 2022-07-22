// Using { Playlist, Track, User } from ../classes/datastores.js

// List of all current playlists
let playlists = [];
// Index of current playlist and list of all tracks of currently selected playlist
let playlist = -1, tracks = [];
// Count of all sample buttons for this playlist and currently selected sample button
let currentButton = -1, buttonCount = 0;
// Sample audio object
let sampleAudio;

function load() {
  // Load saved prefernce settings
  loadSettings();
  // Validate user token
  validateUser().then(valid => {
    if(valid) {
      loadUserInfo();
      loadPlaylists();
    } else {
      window.location.replace('/login');
    }
  });
}

function loadUserInfo() {
  getUser().then(result => {
    if(!result.success) {
      window.location.replace('/login');
      return;
    } else {
      let usernameArea = document.getElementById('usernameArea');
      usernameArea.innerHTML = user.name;
    }
  });
}

function loadPlaylists() {
    getPlaylists().then(result => {
      if(!result.success) {
        window.location.replace('/login');
        return;
      }

      playlists = result.playlists;

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

  getTracks(playlists[index].id)
  .then(result => {
    if(!result.success) {
      window.location.replace('/login');
      return;
    }

    tracks = result.tracks;

    // Set playlist name and description
    playlistNameArea.innerHTML = playlists[index].name;
    playlistDescArea.innerHTML = playlists[index].description;

    // Set track area to visible
    trackArea.style.visibility = 'visible';

    // Enable creation button
    createButton.disabled = false;

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
  });
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
    sampleAudio.pause();

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

  sampleAudio = new Audio(url);

  if(sampleAudio.error) {
    console.log(audio.error);
    alert('Error playing audio');
  } else {
    // Play audio
    sampleAudio.play();

    // Change button text
    let newBtn = document.getElementById(`${index}`);
    currentButton = index;
    newBtn.innerHTML = 'Pause sample';
  }
}

function createSheets() {
  // Send user to create page with currently selected playlist
  const currentPlaylist = playlists[playlist];

  let params = new URLSearchParams();
  console.log(currentPlaylist);
  params.append('name', currentPlaylist.name);
  params.append('id', currentPlaylist.id);

  window.location.href = `/create?${params.toString()}`;
}

function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
  window.location.href = '/';
}