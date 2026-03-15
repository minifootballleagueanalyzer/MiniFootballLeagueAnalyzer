import React from 'react';
import './Header.css';
import { Instagram, Youtube } from 'lucide-react';

import logoImage from '../../assets/main_logo.jpg';

const Header = () => {
  const logoSrc = typeof logoImage === 'object' ? logoImage.src : logoImage;

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-container">
          <img src={logoSrc} alt="MFL Logo" className="main-logo" />
        </div>
        <div className="header-titles">
          <h1 className="title-main">MINI FOOTBALL LEAGUES</h1>
          <p className="title-sub">Murcia, Almería y Granada</p>
        </div>
      </div>

      <div className="header-right">
        <div className="social-icons">
          <a href="https://www.instagram.com/minifootballleagues_espana" className="social-icon" aria-label="Instagram">
            <Instagram size={24} strokeWidth={2} />
          </a>
          <a href="https://www.youtube.com/channel/UCztHwYFe0WIDNA84WGJOWMg#" className="social-icon" aria-label="Youtube">
            <Youtube size={26} strokeWidth={2} />
          </a>
        </div>
        <button className="lang-selector">ES</button>
      </div>
    </header>
  );
};

export default Header;
