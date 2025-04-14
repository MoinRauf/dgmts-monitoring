import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import logo from '../assets/logo.jpg';
import instrumentsData from '../data/instrumentsData.json';

const Instruments: React.FC = () => {
  return (
    <div className="page">
      <Header />
      <Navbar />
      <div className="content">
        <h2>Instruments</h2>
        <div className="data-list">
          <h3>Instrument List</h3>
          <ul>
            {instrumentsData.map((instrument) => (
              <li key={instrument.id}>
                {instrument.name} - Type: {instrument.type} (Last Calibrated: {instrument.lastCalibrated})
              </li>
            ))}
          </ul>
        </div>
        <div className="centered-logo">
        <img
            src={logo}
            alt="DGMTS Logo"
            style={{
              position: "fixed",
              top: "65%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "30vw",
              opacity: 0.1,
              zIndex: -1,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
      <footer>© 2025 DGMTS. All rights reserved.</footer>
    </div>
  );
};

export default Instruments;