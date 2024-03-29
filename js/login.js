function login() {
  // Show loading overlay
  const modal = document.getElementById('loadingModal');
  modal.style.display = 'block';

  console.log('Fetching login');
  fetch('https://bingo-generator-backend-vai2syswsq-ue.a.run.app/auth/login')
  .then(response => {
    return response.text();
  })
  .then(response => {
    const data = JSON.parse(response);
    const redirectData = JSON.parse(data.redirectPackage);

    window.location.replace(`${data.url}?response_type=${redirectData.response_type}&client_id=${redirectData.client_id}&scope=${redirectData.scope}&redirect_uri=${redirectData.redirect_uri}&state=${redirectData.state}`);
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