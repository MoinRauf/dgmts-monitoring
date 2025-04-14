import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Instruments from './pages/Instruments';
import Alarms from './pages/Alarms';
import ProjectGraphs from './pages/ProjectGraphs';
import ViewCustomGraphs from './pages/ViewCustomGraphs';
import FileManager from './pages/FileManager';
import ExportData from './pages/ExportData';
import Help from './pages/Help';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/instruments" element={<Instruments />} />
        <Route path="/alarms" element={<Alarms />} />
        <Route path="/project-graphs" element={<ProjectGraphs />} />
        <Route path="/view-custom-graphs" element={<ViewCustomGraphs />} />
        <Route path="/file-manager" element={<FileManager />} />
        <Route path="/export-data" element={<ExportData />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </Router>
  );
};

export default App;