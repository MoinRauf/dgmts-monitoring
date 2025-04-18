import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import logo from '../assets/logo.jpg';
import filesData from '../data/filesData.json';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const FileManager: React.FC = () => {
  const handleExcelDownload = (sensorName: string) => {
    const worksheetData = [
      ['Sensor Name', 'Reading', 'Timestamp'],
      [sensorName, '123', '2025-04-10 10:00'],
      [sensorName, '127', '2025-04-10 11:00'],
      [sensorName, '122', '2025-04-10 12:00']
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sensor Data');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileName = `${sensorName.replace(/\s/g, '_').toLowerCase()}_data.xlsx`;
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
  };

  return (
    <div className="page">
      <Header />
      <Navbar />
      <div className="content">
        <h2 style={{ textAlign: 'center', marginTop: '20px', color: '#1c1c1c' }}>Sensor File Manager</h2>

        <TableContainer component={Paper} style={{ maxWidth: '95%', margin: '20px auto', border: '1px solid black' }}>
          <Table>
            <TableHead style={{ backgroundColor: '#e0e0e0' }}>
              <TableRow>
                <TableCell style={cellStyleHeader}>Sensor</TableCell>
                <TableCell style={cellStyleHeader}>File Name</TableCell>
                <TableCell style={cellStyleHeader}>Type</TableCell>
                <TableCell style={cellStyleHeader}>Size</TableCell>
                <TableCell style={cellStyleHeader}>Last Modified</TableCell>
                <TableCell style={cellStyleHeader}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filesData.map((file) => (
                <TableRow key={file.id} style={{ backgroundColor: '#fcfcfc' }}>
                  <TableCell style={cellStyleBody}>{file.sensor}</TableCell>
                  <TableCell style={cellStyleBody}>{file.name}</TableCell>
                  <TableCell style={cellStyleBody}>{file.type.toUpperCase()}</TableCell>
                  <TableCell style={cellStyleBody}>{file.size}</TableCell>
                  <TableCell style={cellStyleBody}>{file.lastModified}</TableCell>
                  <TableCell style={cellStyleBody}>
                    <Button
                      variant="contained"
                      style={{
                        padding: '6px 10px',
                        fontSize: '13px',
                        backgroundColor: '#1e88e5',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                      onClick={() => handleExcelDownload(file.sensor)}
                    >
                      Download 
                    </Button>
                  </TableCell>
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
              position: 'fixed',
              top: '65%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '30vw',
              opacity: 0.1,
              zIndex: -1,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
      <footer style={{ textAlign: 'center', padding: '12px', fontSize: '14px', color: '#444' }}>
        © 2025 DGMTS. All rights reserved.
      </footer>
    </div>
  );
};

const cellStyleHeader = {
  fontWeight: 'bold',
  border: '1px solid black',
  textAlign: 'center' as const,
  padding: '10px',
  fontSize: '15px',
};

const cellStyleBody = {
  border: '1px solid black',
  textAlign: 'center' as const,
  padding: '10px',
  fontSize: '14px',
};

export default FileManager;
