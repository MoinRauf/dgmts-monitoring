import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import logo from '../assets/logo.jpg';
import exportDataOptions from '../data/exportDataOptions.json';

const ExportData: React.FC = () => {
  return (
    <div className="page">
      <Header />
      <Navbar />
      <div className="content">
        <h2>Export Data</h2>
        <div className="data-list">
          <h3>Export Options</h3>
          <ul>
            {exportDataOptions.map((option) => (
              <li key={option.id}>
                {option.format} - {option.description}
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

export default ExportData;