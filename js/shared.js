let lightmode = false;

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