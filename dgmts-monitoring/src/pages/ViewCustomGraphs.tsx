import React, { useEffect, useState, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import logo from "../assets/logo.jpg";
import fullData from '../data/customGraphData.json';

// Define the data structure for the graph data
interface GraphData {
  time: string;
  temperature: number;
}

const ViewCustomGraphs: React.FC = () => {
  const [startDate, setStartDate] = useState('2025-04-01');
  const [endDate, setEndDate] = useState('2025-04-09');
  const [filteredData, setFilteredData] = useState<GraphData[]>([]); // Use the GraphData type
  const chartRef = useRef<HTMLDivElement | null>(null);

  // Get today's date in the format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const alertShown = sessionStorage.getItem('alertShown');
    if (!alertShown) {
      fullData.forEach((data: GraphData) => { // Specify GraphData type here
        if (data.temperature > 100) {
          toast.error(`Alert: Temperature ${data.temperature} at ${data.time} exceeds 100!`, {
            position: 'top-right',
            autoClose: 5000,
          });
        }
      });
      sessionStorage.setItem('alertShown', 'true');
    }
  }, []);

  const handleDateChange = () => {
    const filtered = fullData.filter((data: GraphData) => { // Specify GraphData type here
      const dataDate = new Date(data.time);
      return dataDate >= new Date(startDate) && dataDate <= new Date(endDate);
    });
    setFilteredData(filtered);

    // Show success toast after data is filtered and graph is generated
    if (filtered.length > 0) {
      toast.success('Graph generated successfully!', {
        position: 'top-right',
        autoClose: 5000,
      });
    } else {
      toast.warning('No data found for the selected date range.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const downloadGraph = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'graph.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GraphData');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, 'graph-data.xlsx');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '1rem' }}>
      <Header />
      <Navbar />

      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>View Custom Graphs</h2>

      {/* Date Filters */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: 'center', marginBottom: "1rem" }}>
        <div>
          <label style={{ display: 'block' }}>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min="2025-01-01"
            max={today} // Set max to today's date
          />
        </div>
        <div>
          <label style={{ display: 'block' }}>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min="2025-01-01"
            max={today} // Set max to today's date
          />
        </div>
        <button 
          onClick={handleDateChange} 
          style={{ padding: '0.5rem 1rem', marginLeft: '10px' }}
        >
          Generate Graph
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button onClick={downloadGraph} style={{ marginRight: "10px", padding: '0.5rem 1rem' }}>
          📷 Download Graph as Image
        </button>
        <button onClick={exportToExcel} style={{ padding: '0.5rem 1rem' }}>
          📁 Export Data to Excel
        </button>
      </div>

      {/* Line Graph */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3>Temperature Data Over Time</h3>
        {filteredData.length === 0 ? (
          <p>No data available for selected date range.</p>
        ) : (
          <div ref={chartRef} style={{ display: 'flex', justifyContent: 'center' }}>
            <LineChart
              width={600}
              height={300}
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#ff7300" activeDot={{ r: 8 }} />
            </LineChart>
          </div>
        )}
      </div>

      {/* Background Logo */}
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

      <footer style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.9rem", color: "#888" }}>
        © 2025 DGMTS. All rights reserved.
      </footer>

      <ToastContainer />
    </div>
  );
};

export default ViewCustomGraphs;
