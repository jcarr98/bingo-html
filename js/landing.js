function getaccessToken() {
  // Get code from callback
  const params = new URLSearchParams(location.search);
  let code = params.get('code');
  let state = params.get('state');

  let accessToken;

  fetch(`https://bingo-backend.onrender.com/auth/token?code=${code}&state=${state}`)
  .then(response => {
    return response.text();
  })
  .then(response => {
    // Get data
    let data = JSON.parse(response);

    // Get expiry time
    const time = Date.now();
    const expiresIn = parseInt(data.expires_in) * 1000;
    const expiryTime = time + expiresIn;

    // Save data on client
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('tokenExpiry', expiryTime);
    localStorage.setItem('refreshToken', data.refresh_token);

    // Create new user
    createUser(data.access_token, expiryTime, data.refresh_token);

    // Send user to dashboard
    // window.location.replace('/');
    return data.access_token;
  })
  .then(response => {
    return fetch(`https://bingo-backend.onrender.com/log/login?accessToken=${response}`);
  })
  .finally(() => {
    window.location.replace('/');
  })
}