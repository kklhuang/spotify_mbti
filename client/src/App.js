import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react"
import SpotifyWebApi from "spotify-web-api-js";

const spotifyApi = new SpotifyWebApi();

const getTokenFromUrl = () => {
  return window.location.hash.substring(1).split("&").reduce((initial, item) => {
    let parts = item.split("=")
    initial[parts[0]] = decodeURIComponent(parts[1])
    return initial;
  }, {});
};

function App() {
  const [spotifyToken, setSpotifyToken] = useState("");
  const [nowPlaying, setNowPlaying] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [track, setTrack] = useState();
  const [topTracks, setTopTracks] = useState([]);
  const [numTracks, setNumTracks] = useState(0);
  const [artists, setArtists] = useState([]);
  const [numArtists, setNumArtists] = useState(0);
  const [genres, setGenres] = useState([]);
  const [numGenres, setNumGenres] = useState(0);

  useEffect(() => {
    // console.log("This is what we derived from the URL: ", getTokenFromUrl())
    const spotifyToken = getTokenFromUrl().access_token;
    window.location.hash = ""; 
    // console.log("This is our spotify token: ", spotifyToken);
    
    if (spotifyToken) {
      setSpotifyToken(spotifyToken);
      spotifyApi.setAccessToken(spotifyToken)
      spotifyApi.getMe().then((user) => {
        // console.log(user);
      })
      setLoggedIn(true);
    }

  })

  // const getNowPlaying = () => {
  //   spotifyApi.getMyCurrentPlaybackState().then((response) => {
  //     console.log(response)
  //     setNowPlaying({
  //       name: response.item.name,
  //       albumArt: response.item.album.images[0].url
  //     })
  //   })

  //     // setNowPlaying({
  //     //   name: response.items[0].name,
  //     //   albumArt: response.items[0].album.images[0].url
  //     // })
  // }

  const getTopTracksID = () => {
    spotifyApi.getMyTopTracks({
      time_range: "short_term"
    }).then((response) => {
      setNumTracks(response.items.length)
      let tracksList = topTracks;
      for (let i = 0; i < numTracks; i++){
        tracksList.push(response.items[i].id); // song id 
      }
      setTopTracks(tracksList);
    })
  }

  const getAllArtists = () => {
    let listenedArtists = artists;
    for (let i = 0; i < numTracks; i++){
      spotifyApi.getTrack(topTracks[i]).then((response) => {
        let artistURI = response.artists[0].uri.split(':')[2];
        if(listenedArtists.indexOf(artistURI) === -1) {
          listenedArtists.push(artistURI);
        }      
      })
    }
    setArtists(listenedArtists);
    setNumArtists(listenedArtists.length)
  }

  const getAllGenres = () => {
    let listenedGenres = genres; 
    for (let i = 0; i < numArtists; i++){
      spotifyApi.getArtist(artists[i]).then((response) => {
        let artistGenres = response.genres;
        for (let j = 0; j < response.genres.length; j++){
          let currentGenre = artistGenres[j];
          if(listenedGenres.indexOf(currentGenre) === -1) {
            listenedGenres.push(currentGenre);
          }      
        }
      })
    }
    setGenres(listenedGenres);
    console.log(genres);
  }

  return (
    <div className="App">
      {!loggedIn && <a href="http://localhost:8888">Login to Spotify</a>}
      {loggedIn && (
        <>
          <div>Now Playing: {nowPlaying.name}</div>
          <div>
            {/* <img src={nowPlaying.albumArt} style={{height: 150}}/> */}
          </div>
        </>
      )}
      {loggedIn && (
        <div>
          <button onClick={() => getTopTracksID()}>Tracks</button>
          <button onClick={() => getAllArtists()}>Artists</button>
          <button onClick={() => getAllGenres()}>Genres</button>
        </div>
      )}
      {/* <h1>{track.name}</h1> */}
    </div>
  );
}

export default App;
