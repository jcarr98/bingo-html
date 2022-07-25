function login() {
  console.log('Fetching login');
  // fetch('http://localhost:3001/auth/login')
  fetch('https://bingo-logs.herokuapp.com/auth/login')
  .then(response => {
    return response.text();
  })
  .then(response => {
    const data = JSON.parse(response);
    const redirectData = JSON.parse(data.redirectPackage);

    window.location.replace(`${data.url}?response_type=${redirectData.response_type}&client_id=${redirectData.client_id}&scope=${redirectData.scope}&redirect_uri=https://bingo-html.pages.dev/landing&state=${redirectData.state}`);
  })
  .catch(err => {
    console.log(err);
  });
}

function demoLogin() {
  // Just store user token in localhost
  localStorage.setItem('accessToken', 'demo');
  localStorage.setItem('tokenExpiry', -1);
  localStorage.setItem('refreshToken', 'demo');
  
  // Load dashboard
  window.location.href = `/`;
}