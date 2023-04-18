import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react"
import SpotifyWebApi from "spotify-web-api-js";
import Navbar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';
import { BrowserRouter as Router, Routes, Route} from "react-dom"

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
  // const [lenTopTracks, setLenTopTracks] = useState(0);
  const [numTracks, setNumTracks] = useState(0);
  const [artists, setArtists] = useState([]);
  const [numArtists, setNumArtists] = useState(0);
  const [genres, setGenres] = useState([]);
  const [numGenres, setNumGenres] = useState(0);
  const [numPlaylists, setNumPlaylists] = useState([]);
  const [playlistsAndGenres, setPlaylistsAndGenres] = useState(0);
  const [topHits, setTopHits] = useState([]);
  const [userID, setUserID] = useState("");
  const [newPlaylist, setNewPlaylist] = useState("");
  const [personalityComplete, setPersonalityComplete] = useState(false)
  const oldYearVar = 2003; 
 

  // Personality scores 
  const [playlistScore, setPlaylistScore] = useState("");
  const [varietyScore, setVarietyScore] = useState("");
  const [popularityScore, setPopularityScore] = useState("");
  const [timeScore, setTimeScore] = useState("");

  const personalities = {
	"M": "Minimalist",
	"D": "Detailed",
	"L": "Loyal",
	"E": "Eclectic",
	"T": "Trendsetter",
	"B": "Bandwagon",
	"P": "Presentist",
	"V": "Vintage"
  }

  const descriptions = {
	"TEST" : "Personality description hereLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
  }

  const [personality, setPersonality] = useState("");
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
      setUserID(response.id)
    })
  })

//   async function makePersonalityPlaylist() {
//       const response = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
//         headers: {
//           'Authorization': `Bearer ${spotifyToken}`
//         }
//       }); 
//   }

  const makePersonalityPlaylist = async () => {
	const response = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
	  method: 'POST',
	  headers: {
		'Authorization': `Bearer ${spotifyToken}`,
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({
		name: personality + " Playlist",
		description: "The playlist that created your Spotify Listener's Personality! Made by Karen Huang :)"
	  })
	});
  
	const data = await response.json();
	setNewPlaylist(data.id)
	return data.id; // return the new playlist ID

  };

  const makePlaylist = async () => {
	var uriArray = []
	for (let i = 0; i < numTracks; i++) {
		uriArray.push("spotify:track:" + topTracks[i])
	}
	const response = await fetch(`https://api.spotify.com/v1/playlists/${newPlaylist}/tracks`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${spotifyToken}`,
			'Content-Type': 'application/json'
			},
		body: JSON.stringify({
			uris: uriArray
		})
	});
  };
  
  async function fetchTopTrackDates() {
    var numOlder = 0;
    for (let i = 0; i < numTracks; i++){
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
    try {
      const topHitsIdsLen = topHitsIds.length;
      var listTopHits = [];
      for (let i = 0; i < topHitsIdsLen; i++) {
        listTopHits.push(topHitsIds[i].track.id)
      }
      setTopHits(listTopHits);
    } catch (error) {
    }

  }

  function numTracksInTopHits() {
    const userTracksLen = topTracks.length;
    const topTracksLen = topHits.length;
    var same = [];
    for (let user = 0; user < userTracksLen; user++){
      for (let top = 0; top < topTracksLen; top++) {
        if (topTracks[user] === topHits[top]) {
          same.push(topTracks[user])
        } 
      }
    }
    return same.length;
  }

  const getNowPlaying = () => {
    spotifyApi.getMyCurrentPlaybackState().then((response) => {
      setNowPlaying({
        name: response.item.name,
        albumArt: response.item.album.images[0].url
      })
    })
  }

  const getTopTracksID = () => {
    spotifyApi.getMyTopTracks({
      limit: 50,
      time_range: "medium_term"
    }).then((response) => {
      setNumTracks(response.items.length)
      let tracksList = topTracks;
      for (let i = 0; i < numTracks; i++){
        let trackID = response.items[i].id
        if(tracksList.indexOf(trackID) === -1){
          tracksList.push(trackID); // song id 
        }
        
      }
      setTopTracks(tracksList);
    })
  }

  async function fetchAllArtists() {
    getTopTracksID()
    let listenedArtists = artists;
    for (let i = 0; i < numTracks; i++){
      const response = await fetch(`https://api.spotify.com/v1/tracks/${topTracks[i]}`, {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      }); 
      const json = await response.json();  
      const artistURI = json.artists[0].uri.split(':')[2];
      if(listenedArtists.indexOf(artistURI) === -1) {
        listenedArtists.push(artistURI);
      }   
    } 
    setArtists(listenedArtists);
    setNumArtists(listenedArtists.length)
  }

  async function getAllArtists() {
    await getTopTracksID()
    let listenedArtists = artists;
    if(loggedIn){
      if (topTracks[0] === undefined) {
        await getTopTracksID()
      } else {
        for (let i = 0; i < numTracks; i++){
          spotifyApi.getTrack(topTracks[i]).then((response) => {
            let artistURI = response.artists[0].uri.split(':')[2];
            if(listenedArtists.indexOf(artistURI) === -1) {
              listenedArtists.push(artistURI);
            }      
          }).catch(e => {
          })
        }
        setArtists(listenedArtists);
        setNumArtists(listenedArtists.length)
      }
    }
  }

  useEffect(() => {
    getAllArtists()
    console.log("here")
  },[topTracks])

  useEffect(() => {
    console.log("numtracks", numTracks)
  },[numTracks])
  useEffect(() => {
    console.log("artists length", numArtists)
  },[numArtists])

  const getAllGenres = () => {
	console.log("getting genres")
	console.log(genres)
    let listenedGenres = genres; 
	console.log(numArtists)
    for (let i = 0; i < numArtists; i++){
      spotifyApi.getArtist(artists[i]).then((response) => {
        let artistGenres = response.genres;
        for (let j = 0; j < response.genres.length; j++){
          let currentGenre = artistGenres[j];
          if(listenedGenres.indexOf(currentGenre) === -1) {
            listenedGenres.push(currentGenre);
          }      
        }
      }).catch(e => {
      })
    }
    setGenres(listenedGenres);
    setNumGenres(listenedGenres.length)
	console.log("set genres", listenedGenres.length)
	setPlaylistsAndGenres(listenedGenres.length+numArtists)
  }

  useEffect(() => {
	getAllGenres()
  },[numArtists])

  useEffect(() => {
	calcVarietyScore()
  },[genres])

  const getPlaylists = () => {
    let user = spotifyApi.getMe();
    spotifyApi.getUserPlaylists({
      user_id: user,
      limit: 50
    }).then((response) => {
      setNumPlaylists(response.items.length)
    }) 
  }

  
  // For playlist score:
  const calcPlaylistScore = () => {
    getPlaylists()
    if (numPlaylists <= 10) {
      setPlaylistScore('M');
    } else {
      setPlaylistScore('D');
    }
  }

  useEffect(() => {
    if (numPlaylists <= 10) {
      setPlaylistScore('M');
    } else {
      setPlaylistScore('D');
    }
    // console.log(numPlaylists)
  },[numPlaylists])

  // For variety score:
  const calcVarietyScore = () => {
    getAllArtists();
    getAllGenres();
    var score = playlistsAndGenres;
	console.log("score", score)
    if (score <= 28) {
      setVarietyScore('L');
    } else {
      setVarietyScore('E');
    }
  }

  useEffect(()=>{
	console.log("variety score", varietyScore)
	if(varietyScore > 0){
		giveSpotifyMBTI()
		setPersonality(playlistScore.concat(varietyScore, popularityScore, timeScore))
	}
  },[varietyScore])

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
    fetchTopHitsIDs()
    fetchTopTrackDates()
    getTopTracksID()

    calcPlaylistScore()
    calcVarietyScore()
    calcPopularityScore()
    calcTimeScore()
	console.log(numGenres)
    console.log(playlistScore, varietyScore, popularityScore, timeScore)
    setPersonality(playlistScore.concat(varietyScore, popularityScore, timeScore))
  }

  useEffect(() => {
    console.log(personality)
	if (personality.length === 4){
		setPersonalityComplete(true)
	}
  },[personality])

  // making playlist useeffect DON'T DELETE
  useEffect(() => {
	makePlaylist()
  }, [newPlaylist])

  useEffect(() => {
	calcVarietyScore()
	giveSpotifyMBTI()
  }, [personality])

//   useEffect(() => {
// 	giveSpotifyMBTI()	
//   }, [loggedIn])

// loggedIn && has personality set 
  return (
    <div className="App">
      <Navbar />
      {!loggedIn && <Home />}
	  {loggedIn && !personalityComplete && 
		<div className='loading-screen'>
			<img src={"././loading.gif"} className="loading" alt="loading" />
			<div className='loading-message'>
				Calculating your listening personality...
			</div>
		</div>
	  }
	  {loggedIn && 
	  <div>
		{loggedIn && personalityComplete ?
			<div>
				<button onClick={() => giveSpotifyMBTI()}>Get MBTI!</button>
				<div className='results'>
					<div className='personality-side'>
						<div className='personality-header'>
							<div className='reg-personality-text'>
								Your personality is  
							</div>
							<div className='header-acc-personality'>
								&nbsp;{personality}
							</div> 
						</div>
						<div className='personality-letters'>	
							<div className='first-letter'>
							{personality[0]}
							<div className='letter-description'>
								{personalities[personality[0]].slice(1)}
							</div>
							</div>
							<div className='second-letter'>
								{personality[1]}
								<div className='letter-description'>
									{personalities[personality[1]].slice(1)}
								</div>
							</div>
							<div className='third-letter'>
								{personality[2]}
								<div className='letter-description'>
									{personalities[personality[2]].slice(1)}
								</div>
							</div>
							<div className='fourth-letter'>
								{personality[3]}
								<div className='letter-description'>
									{personalities[personality[3]].slice(1)}
								</div>
							</div>
						</div>
						<div className='personality-desc'>
							{descriptions['TEST']}
						</div>
						
					</div>
					<div className='playlist-side'>
						<div className='make-playlist-section'>
							<div className='make-playlist'>
								Click
							</div>
							<div onClick={() => makePersonalityPlaylist()} className='make-playlist-link'>
								&nbsp;here&nbsp;
							</div>
							<div className='make-playlist'>
								for your personality playlist
							</div>
						</div>
						<div className='player'>
						<link
							rel="preload"
							href="https://open.spotifycdn.com/cdn/fonts/spoticon_regular_2.d728648c.woff2"
							type="font/woff2"
							crossOrigin="anonymous"
						/>
							<iframe src={`https://open.spotify.com/embed/track/${topTracks[0]}?utm_source=generator&theme=0`} width="100%" height="352" frameBorder="0" allowfullscreen="" allow="encrypted-media" allowtransparency="true" loading="lazy"></iframe>
						</div>
					</div>

				</div>
			</div>
		: 
			<div>
				<button onClick={() => giveSpotifyMBTI()}>Get MBTI!</button>
			</div>}
		</div>
		}
      {/* <h1>{track.name}</h1> */}
      <Footer />
    </div>
  );
}

export default App;

