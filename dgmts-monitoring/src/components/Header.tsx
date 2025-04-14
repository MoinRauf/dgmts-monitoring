import React from 'react';
import logo from '../assets/logo.jpg';

const Header: React.FC = () => {
  return (
    <div className="header">
      <img src={logo} alt="DGMTS Logo" className="logo" />
      <div className="header-text">
        <h1>Dulles Geotechnical and Material Testing Services Inc.</h1>
        <p>A Certified SWaM and MBE/DBE Firm</p>
      </div>
    </div>
  );
};

export default Header;