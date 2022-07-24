let lightmode = false;
let user;

function loadSettings() {
  // Load theme
  let savedMode = localStorage.getItem('mode');
  if(savedMode != null) {
    try {
      lightmode = (savedMode === 'true');
    } catch(e) {
      console.log('Error loading saved theme');
      console.log(e);
      localStorage.removeItem('mode');
    }
  }

  setMode(lightmode);
}

function switchMode() {
  // Update mode
  lightmode = !lightmode;

  // Change mode
  setMode(lightmode);

  // Update cookie
  localStorage.setItem('mode', lightmode);
}

function setMode(mode) {
  let classname = mode ? 'light' : 'dark';

  // Change button text
  let text = `${classname} mode`;
  document.getElementById('modeSwitch').innerHTML = text;

  // Change html class
  document.documentElement.className = classname;
}

function createUser(accessToken, tokenExpiry, refreshToken) {
  user = new User(accessToken);
  user.expiry = tokenExpiry;
  // TODO - Implement refresh token procedure with backend
}

async function validateUser(action=null) {
  // Check if we already have user loaded
  if(user === undefined || user.token === null) {
    // If not, check if we have user saved
    if(localStorage.getItem('accessToken') !== null) {
      // If we do, get all user data and create new user
      const accessToken = localStorage.getItem('accessToken');
      const tokenExpiry = parseInt(localStorage.getItem('tokenExpiry'));
      const refreshToken = localStorage.getItem('refreshToken');

      createUser(accessToken, tokenExpiry, refreshToken);
    } else {
      // If not, user is not valid
      return false;
    }
  }

  // Check if we already know token is expired
  const expiryTime = parseInt(localStorage.getItem('tokenExpiry'));

  // No need to check expiry time if < 0; demo account
  if(expiryTime < 0) {
    return true;
  }
  
  // If no expiry is present or token is expired, send user to login page
  // Otherwise, let them continue
  const currentTime = Date.now();
  if(expiryTime === null || isNaN(expiryTime) || currentTime > expiryTime) {
    return false;
  }

  // Fetch validation from backend
  const fetchStr = action == null ? `https://bingo-logs.herokuapp.com/auth/validate?accessToken=${user.token}` : `https://bingo-logs.herokuapp.com/auth/validate?accessToken=${user.token}&action=${action}`;
  // const fetchStr = action == null ? `http://localhost:3001/auth/validate?accessToken=${user.token}` : `http://localhost:3001/auth/validate?accessToken=${user.token}&action=${action}`;
  let data = await fetch(fetchStr);

  // Return if user's access token is valid
  return data.status === 200;
}

async function getUser() {
  const promise = await fetch(`https://bingo-logs.herokuapp.com/music/me?accessToken=${user.token}`);
  // const promise = await fetch(`http://localhost:3001/music/me?accessToken=${user.token}`);
  if(promise.status !== 200) {
    return { success: false };
  }
  const promise2 = await promise.text();
  const data = JSON.parse(promise2);

  // `user` is a global variable to be used throughout
  user["name"] = data.display_name;
  user["href"] = data.href;
  user["id"] = data.id;

  return { success: true };
}

async function getPlaylists() {
  // Check if we have playlists cached
  if(user.playlists) {
    return user.playlists;
  }

  const response = await fetch(`https://bingo-logs.herokuapp.com/music/playlists?accessToken=${user.token}`);
  // const response = await fetch(`http://localhost:3001/music/playlists?accessToken=${user.token}`);
  // First response contains status of fetch to Spotify
  if(response.status !== 200) {
    return { success: false };
  }

  // Get text from original response
  const response_1 = await response.text();

  let data = JSON.parse(response_1);

  let playlists = [];

  // Load each playlist
  for (const element of data) {
    // Only add playlist that have >= 25 songs
    if (element.tracks.total < 25) {
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

  // Cache playlists for later use
  user["playlists"] = playlists;

  return {
    success: true,
    playlists: playlists
  };
}

/* Tracks code */
async function getTracks(playlistId) {
  // Get all tracks from the specified playlist
  const response_1 = await fetch(`https://bingo-logs.herokuapp.com/music/tracks?accessToken=${user.token}&playlistId=${playlistId}`);
  // const response_1 = await fetch(`http://localhost:3001/music/tracks?accessToken=${user.token}&playlistId=${playlistId}`);
  if(response_1.status !== 200) {
    return false;
  }
  const response_2 = await response_1.text();
  const data = JSON.parse(response_2);

  let tracks = [];

  // Save each track with wanted data
  for(const element of data) {
    // Some tracks return null??
    if(element.track === null) continue;

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

  return {
    success: true,
    tracks: tracks
  }
}

function toggleDropdown() {
  let dropdown = document.getElementById('apps-dropdown');
  const children = dropdown.children;
  const display = dropdown.style.display;
  
  // Add or remove animation from children;
  for(let i = 0; i < children.length; i++) {
    let a = children[i];
    a.style.animationName = 'fadein';
    a.style.animationDuration = '1s';
    a.style.animationDelay = `${i/5.5}s`;
    a.style.animationFillMode = 'forwards';
  }

  // Change visibility
  dropdown.style.display = display === 'block' ? 'none' : 'block';
}