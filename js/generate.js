function getData() {
  const params = new URLSearchParams(location.search);
  const title = params.get('title');
  const tracks = JSON.parse(params.get('tracks'));

  console.log(title);
  console.log(tracks);
}