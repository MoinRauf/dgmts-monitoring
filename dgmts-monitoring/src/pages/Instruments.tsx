import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import logo from '../assets/logo.jpg';
import instrumentsData from '../data/instrumentsData.json';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const Instruments: React.FC = () => {
  return (
    <div className="page">
      <Header />
      <Navbar />
      <div className="content" style={{ padding: '2rem' }}>
        <h2>Instruments</h2>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Instrument Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Last Calibrated</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {instrumentsData.map((instrument) => (
                <TableRow key={instrument.id}>
                  <TableCell>{instrument.name}</TableCell>
                  <TableCell>{instrument.type}</TableCell>
                  <TableCell>{instrument.lastCalibrated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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
