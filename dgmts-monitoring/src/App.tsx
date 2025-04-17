// src/App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '../src/Routes/Routes';

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
