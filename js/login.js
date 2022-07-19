function login() {
  console.log('Fetching login');
  fetch('http://localhost:3001/auth/login')
  .then(response => {
    return response.text();
  })
  .then(response => {
    const data = JSON.parse(response);
    const redirectData = JSON.parse(data.redirectPackage);

    console.log(data);

    window.location.replace(`${data.url}?response_type=${redirectData.response_type}&client_id=${redirectData.client_id}&scope=${redirectData.scope}&redirect_uri=${redirectData.redirect_uri}&state=${redirectData.state}`);
  })
  .catch(err => {
    console.log(err);
  });
}