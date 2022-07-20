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

function validateUser() {
  // Get (allegedly) saved token
  let userToken = localStorage.getItem('userToken');
  user = new User(userToken);

  // Check if user has token
  if(user.token === null) {
    window.location.replace('/login');
    return;
  }

  // If user has token, check for expiry time
  // const expiryTime = Number(localStorage.getItem('tokenExpiry'));
  const expiryTime = parseInt(localStorage.getItem('tokenExpiry'));

  // No need to check expiry time if < 0; demo account
  if(expiryTime < 0) {
    return;
  }
  
  // If no expiry is present or token is expired, send user to login page
  // Otherwise, let them continue
  const currentTime = Date.now();
  if(expiryTime === null || isNaN(expiryTime) || currentTime > expiryTime) {
    window.location.replace('/login');
  } else {
    user.expiry = expiryTime;
  }
}