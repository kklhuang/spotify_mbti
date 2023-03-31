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
  const [lenTopTracks, setLenTopTracks] = useState(0);
  const [numTracks, setNumTracks] = useState(0);
  const [artists, setArtists] = useState([]);
  const [numArtists, setNumArtists] = useState(0);
  const [genres, setGenres] = useState([]);
  const [numGenres, setNumGenres] = useState(0);
  const [numPlaylists, setNumPlaylists] = useState([]);
  const [topHits, setTopHits] = useState([]);
  const [userID, setUserID] = useState("");
  const oldYearVar = 2003; 
 

  // Personality scores 
  const [playlistScore, setPlaylistScore] = useState("");
  const [varietyScore, setVarietyScore] = useState("");
  const [popularityScore, setPopularityScore] = useState("");
  const [timeScore, setTimeScore] = useState("");
  const [songsInTopHits, setSongsInTopHits] = useState([])

  const topHitsPlaylistId = "37i9dQZF1DXcBWIGoYBM5M";
  // https://open.spotify.com/playlist/7qU0L6POiIdsgccoLKy3EX?si=e5f9e9a921b14b52
  // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=f9967bf1e01c4eb9


  useEffect(() => {
    // console.log("This is what we derived from the URL: ", getTokenFromUrl())
    const spotifyToken = getTokenFromUrl().access_token;
    window.location.hash = ""; 
    if (spotifyToken) {
      setSpotifyToken(spotifyToken);
      spotifyApi.setAccessToken(spotifyToken)
      // spotifyApi.getMe().then((user) => {
      //   console.log(user);
      // })
      setLoggedIn(true); 
    }
    spotifyApi.getMe().then((response) => {
      console.log(response)
    })
  })

  useEffect(() => {
    getTopTracksID();
    getAllArtists();
    getAllGenres();
    getPlaylists();
    fetchTopHitsIDs();
    numTracksInTopHits();
    fetchTopTrackDates();
  }, [spotifyToken, topTracks]);


  async function fetchTopTrackDates() {
    var numOlder = 0;
    for (let i = 0; i < lenTopTracks; i++){
      const response = await fetch(`https://api.spotify.com/v1/tracks/${topTracks[i]}`, {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      }); 
      const json = await response.json();  
      const date = json.album.release_date;
      const year = date.slice(0,4);
      if (year <= oldYearVar) {
        ++numOlder;
      }
    } 
    return numOlder
  }

  async function fetchTopHitsIDs() {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${topHitsPlaylistId}/tracks?fields=items(track(id))`, {
      headers: {
        'Authorization': `Bearer ${spotifyToken}`
      }
    });  
    const json = await response.json();
    const topHitsIds = json.items;
    const topHitsIdsLen = topHitsIds.length;
    var listTopHits = [];
    for (let i = 0; i < topHitsIdsLen; i++) {
      listTopHits.push(topHitsIds[i].track.id)
    }
    setTopHits(listTopHits);
  }

  function numTracksInTopHits() {
    const userTracksLen = topTracks.length;
    const topTracksLen = topHits.length;
    var same = [];
    for (let user = 0; user < userTracksLen; user++){
      for (let top = 0; top < topTracksLen; top++) {
        if (topTracks[user] === topHits[top]) {
          // console.log(topTracks[user])
          same.push(topTracks[user])
        } 
      }
    }
    return same.length;
  }



  useEffect(() => {
    
    // spotifyApi.getPlaylistTracks({
    //   playlistId: "37i9dQZF1DXcBWIGoYBM5M",
    // }).then((response) => {
    //   console.log(response)
    //   setSongsInTopHits(response)
    // })

  }, [spotifyToken])

  useEffect(() => {
    getNowPlaying()
  }, [])

  const getNowPlaying = () => {
    spotifyApi.getMyCurrentPlaybackState().then((response) => {
      setNowPlaying({
        name: response.item.name,
        albumArt: response.item.album.images[0].url
      })
    })

      // setNowPlaying({
      //   name: response.items[0].name,
      //   albumArt: response.items[0].album.images[0].url
      // })
  }

  const getTopTracksID = () => {
    spotifyApi.getMyTopTracks({
      limit: 50,
      time_range: "medium_term"
    }).then((response) => {
      setNumTracks(response.items.length)
      let tracksList = topTracks;
      for (let i = 0; i < numTracks; i++){
        // console.log(response.items[i].name)
        let trackID = response.items[i].id
        if(tracksList.indexOf(trackID) === -1){
          tracksList.push(trackID); // song id 
        }
        
      }
      setTopTracks(tracksList);
      setLenTopTracks(tracksList.length);
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
    setNumGenres(listenedGenres.length)
  }

  const getPlaylists = () => {
    let user = spotifyApi.getMe();
    spotifyApi.getUserPlaylists({
      user_id: user,
      limit: 50
    }).then((response) => {
      setNumPlaylists(response.total)
    }) 
  }

  
  // For playlist score:
  const calcPlaylistScore = () => {
    if (numPlaylists <= 10) {
      setPlaylistScore('M');
    } else {
      setPlaylistScore('F');
    }
  }

  // For variety score:
  const calcVarietyScore = () => {
    // numArtists 
    // numGenres
    var score = numArtists + numGenres;
    if (score <= 28) {
      setVarietyScore('L');
    } else {
      setVarietyScore('E');
    }
  }

  // For popularity score:
  const calcPopularityScore = () => {
    var numInTop = numTracksInTopHits(); 
    if (numInTop <= 8) {
      setPopularityScore('T'); 
    } else {
      setPopularityScore('B');
    }
  }

  // For time score:  
  const calcTimeScore = () => {
    var oldies = fetchTopTrackDates();
    if (oldies >= 10) {
      setTimeScore('V');
    } else {
      setTimeScore('P');
    }
  }

  const giveSpotifyMBTI = () => {
    calcPlaylistScore()
    calcVarietyScore()
    calcPopularityScore()
    calcTimeScore()
    console.log(playlistScore, varietyScore, popularityScore, timeScore)
  }

  const createPlaylist = () => {

  }

  return (
    <div className="App">
      {!loggedIn && <a href="http://localhost:8888">Login to Spotify</a>}
      {loggedIn && (
        <>
          <div>Now Playing: {nowPlaying.name}</div>
          <div>
            <img src={nowPlaying.albumArt} style={{height: 150}}/>
          </div>
        </>
      )}
      {loggedIn && (
        <div>
          <button onClick={() => getTopTracksID()}>Tracks</button>
          <button onClick={() => getAllArtists()}>Artists</button>
          <button onClick={() => getAllGenres()}>Genres</button>
          <button onClick={() => giveSpotifyMBTI()}>Get MBTI!</button>
        </div>
      )}
      {/* <h1>{track.name}</h1> */}
    </div>
  );
}

export default App;
