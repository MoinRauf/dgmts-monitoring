import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import logo from '../assets/logo.jpg';
import filesData from '../data/filesData.json';

const FileManager: React.FC = () => {
  return (
    <div className="page">
      <Header />
      <Navbar />
      <div className="content">
        <h2>File Manager</h2>
        <div className="data-list">
          <h3>Files</h3>
          <ul>
            {filesData.map((file) => (
              <li key={file.id}>
                {file.name} - Size: {file.size} (Last Modified: {file.lastModified})
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

export default FileManager;