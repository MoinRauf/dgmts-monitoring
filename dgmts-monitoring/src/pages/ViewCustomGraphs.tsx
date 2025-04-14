import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { toast, ToastContainer } from 'react-toastify'; // Import react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for toastify
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import logo from "../assets/logo.jpg";
import customGraphData from '../data/customGraphData.json'; // Temperature data
import humidityData from '../data/humidityData.json'; // Humidity data (not needed for toast)

const ViewCustomGraphs: React.FC = () => {
  useEffect(() => {
    // Check temperature data and show toast alert if any value exceeds 100
    customGraphData.forEach((data) => {
      if (data.temperature > 100) {
        toast.error(`Alert: Temperature ${data.temperature} at ${data.time} exceeds 100!`, {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    });
  }, []); // Empty dependency array to run this effect only once when the component mounts

  return (
    <div className="page">
      <Header />
      <Navbar />
      <div className="content">
        <h2>View Custom Graphs</h2>
        <div className="graph-row">
          {/* Temperature Data Graph */}
          <div className="line-graph">
            <h3>Temperature Data Over Time</h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LineChart width={400} height={300} data={customGraphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperature" stroke="#ff7300" activeDot={{ r: 8 }} />
              </LineChart>
            </div>
          </div>

          <div style={{ width: '5px' }}></div> {/* 5px gap */}

          {/* Humidity Data Graph */}
          <div className="line-graph">
            <h3>Humidity Data Over Time</h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LineChart width={400} height={300} data={humidityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="humidity" stroke="#00b7eb" activeDot={{ r: 8 }} />
              </LineChart>
            </div>
          </div>
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

      {/* Toast container */}
      <ToastContainer />
    </div>
  );
};

export default ViewCustomGraphs;
