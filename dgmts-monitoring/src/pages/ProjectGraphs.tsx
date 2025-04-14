import React from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import LineGraph from "../components/LineGraph";
import PressureGraph from "../components/PressureGraph";
import logo from "../assets/logo.jpg";

// import Logo from '../components/Logo';
// import Logo from '../components/Logo';


const ProjectGraphs: React.FC = () => {
  return (
    <div className="page">
      <Header />
      <Navbar />
      <div className="content">
        <h2>Project Graphs</h2>
        <div className="graph-row">
          <LineGraph />
          <div style={{ width: "5px" }}></div> {/* 5px gap */}
          <PressureGraph />
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

export default ProjectGraphs;


