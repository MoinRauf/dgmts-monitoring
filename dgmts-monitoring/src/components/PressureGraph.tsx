import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import pressureData from '../data/pressureData.json';

const PressureGraph: React.FC = () => {
  return (
    <div className="line-graph">
      <h3>Pressure Data Over Time</h3>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <LineChart
          width={400}
          height={300}
          data={pressureData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="pressure"
            stroke="#82ca9d"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </div>
    </div>
  );
};

export default PressureGraph;
