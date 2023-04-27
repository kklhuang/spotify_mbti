import React from "react";
import "./css/home.css";
  
const Home = () => {
    return (
        
        <div className="home">
            <div className="home-main-title">
                Find out your Spotify Listening Personality. 
            </div>
            <div className="home-sub-title">
                (But with a Myers Briggs-esque twist)
            </div>
            <div className="spotify-login">
                <button className="login-button">
                    <a href="https://spotify-mbti.vercel.app/login">Log in with Spotify here</a> // goes to backend for login
                </button>
            </div>
        </div>
        
      );
};
  
export default Home;
