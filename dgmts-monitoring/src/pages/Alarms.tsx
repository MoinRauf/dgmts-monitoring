import React, { useState, useMemo } from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import logo from "../assets/logo.jpg";
import alarmsData from "../data/alarmsData.json";

// Properly typed Alarm object with an index signature for dynamic key access
type Alarm = {
  timestamp: string;
  sensor: string;
  limit: string;
  equation: string;
  value: number;
  acknowledged: boolean;
  acknowledgedTimestamp: string | null;
  user: string | null;
  comment: string;
  [key: string]: string | number | boolean | null | undefined;
};

const Alarms: React.FC = () => {
  const [filterAck, setFilterAck] = useState(true);

  // Get unique list of all keys from the data
  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    alarmsData.forEach((alarm: Alarm) => {
      Object.keys(alarm).forEach((key) => keys.add(key));
    });
    return Array.from(keys);
  }, []);

  // Filter the data based on acknowledgment status
  const filteredData = useMemo(() => {
    return alarmsData.filter(
      (alarm: Alarm) => alarm.acknowledged === filterAck
    );
  }, [filterAck]);

  return (
    <div className="page">
      <Header />
      <Navbar />
      <div className="content">
        <h2>Alarms</h2>

        {/* Dropdown to toggle acknowledged/unacknowledged */}
        <div style={{ marginBottom: "1rem" }}>
          <select
            id="ackFilter"
            value={filterAck ? "true" : "false"}
            onChange={(e) => setFilterAck(e.target.value === "true")}
          >
            <option value="true">Acknowledged</option>
            <option value="false">Not Acknowledged</option>
          </select>
        </div>

        {/* Alarms Table */}
        <div className="data-table">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr>
                {allKeys.map((key) => (
                  <th
                    key={key}
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                      backgroundColor: "#f2f2f2",
                      textAlign: "left",
                      wordWrap: "break-word",
                      maxWidth: "200px",
                    }}
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((alarm: Alarm, idx) => (
                <tr key={idx}>
                  {allKeys.map((key) => (
                    <td
                      key={key}
                      style={{
                        border: "1px solid #ddd",
                        padding: "10px",
                        textAlign: "left",
                        wordWrap: "break-word",
                        maxWidth: "200px",
                      }}
                    >
                      {alarm[key] !== undefined ? String(alarm[key]) : "N/A"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Centered Background Logo */}
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

export default Alarms;
