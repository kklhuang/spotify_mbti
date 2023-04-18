import React from "react";
import "./css/navbar.css";
  
const Navbar = () => {
  return (
    <div className="navbar">
        <ul className="menu">
            <div className="title-nav">
                <li className="title">
                    <img src={"././logo.png"} className="logo" alt="logo" /> <a href = "">Spotify Listener's Personality Indicator</a>
                </li>
            </div>
            <div className="other-menu-nav">
                <li>
                    <a href = "">Home</a>
                </li>
                <li>
                    <a href = "/about">About</a>
                </li>
            </div>
            
        </ul>
        
    </div>
  );
};
  
export default Navbar;