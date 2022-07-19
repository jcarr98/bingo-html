class User {
  constructor(token) {
    this._token = token;
    this._expiry = null;
    this._name = null;
    this._href = null;
    this._id = null;
  }

  /**
   * @return {String} User access token
   */
  get token() {
    return this._token;
  }

  /**
   * @param {Number} expiry
   */
  set expiry(expiry) {
    this._expiry = expiry;
  }
  get expiry() {
    return this._expiry;
  }

  /**
   * @param {String} name
   */
  set name(name) {
    this._name = name;
  }
  get name() {
    return this._name;
  }

  /**
   * @param {String} href
   */
  set href(href) {
    this._href = href;
  }
  get href() {
    return this._href;
  }

  /**
   * @param {String} id
   */
  set id(id) {
    this._id = id;
  }
  get id() {
    return this._id;
  }
}

class Playlist {
  /**
   * @param {String} id 
   * @param {String} name 
   * @param {String} description 
   * @param {Number} number_tracks 
   */
  constructor(id, name, description, number_tracks) {
    this._id = id;
    this._name = name;
    this._description = description;
    this._number_tracks = number_tracks;
  }

  /**
   * @return {String} The playlist ID
   */
  get id() {
    return this._id;
  }

  /**
   * @return {String} The playlist name
   */
  get name() {
    return this._name;
  }

  /**
   * @return {String} The playlist description
   */
  get description() {
    return this._description;
  }

  /**
   * @returns {Number} The number of tracks in the playlist
   */
  get number_tracks() {
    return this._number_tracks;
  }
}

class Track {
  /**
   * 
   * @param {String} name 
   * @param {Object[]} artists 
   * @param {String} album 
   * @param {String} album_art 
   * @param {*} preview 
   */
  constructor(name, artists, album, album_art, preview) {
    this._name = name;
    this._artists = this.#load_artists(artists);
    this._album = album;
    this._album_art = album_art;
    this._preview = preview;
  }

  get name() {
    return this._name;
  }

  get artists() {
    return this._artists;
  }

  get album() {
    return this._album;
  }

  get album_art() {
    return this._album_art;
  }

  get preview() {
    return this._preview;
  }

  #load_artists(artists) {
    let artistNames = [];

    for(const artist of artists) {
      artistNames.push(artist.name);
    }

    return artistNames;
  }

  artist_string() {
    let str = 'By: ';

    for(let i = 0; i < this._artists.length; i++) {
      str = str + this._artists[i];

      if(i < this._artists.length-1) {
        str = str + ', ';
      }
    }

    return str;
  }
}