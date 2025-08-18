import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Intro.css';
import bg1 from "../../assets/bg1.jpeg";
import bg2 from "../../assets/bg2.jpg";
import bg3 from "../../assets/bg3.jpg";
import uomLogo from "../../assets/uom_logo.png";

const images = [bg1, bg2, bg3];

const Intro = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="intro-container"
      style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
    >
      <div className="overlay" />
      <nav className="navbar">
        <div className="navbar-left">
          <img src={uomLogo} alt="UOM Logo" className="logo" />
          <h1 className="smartmed">SmartMed</h1>
        </div>
        <div className="navbar-right">
          <Link to="/login">
            <button className="nav-button">Sign In</button>
          </Link>
          <Link to="/register">
            <button className="nav-button signup">Sign Up</button>
          </Link>
        </div>
        
      </nav>

      <div className="intro-content">
        <h2 className="welcome-text">Welcome to</h2>
         <h1 className="university-name">
          Institute of Technology 
          University of Moratuwa <br /> 
        <span className="highlight-text">Medical Center</span>       
         </h1>
        <p className="tagline">Your Health, Our Priority</p>
      </div>
    </div>
  );
};

export default Intro;
