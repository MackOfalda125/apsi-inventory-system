import React from 'react';
import './topbar.css';

const Topbar = ({ currentScreen = "Dashboard", onMenuToggle, isMenuOpen = false }) => {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button 
          className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`}
          onClick={onMenuToggle}
          aria-label="Toggle sidebar menu"
        >
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </button>
        <h1 className="screen-title">{currentScreen}</h1>
      </div>
      
      <div className="topbar-right">
        <span className="placeholder-text">Text</span>
      </div>
    </div>
  );
};

export default Topbar;
