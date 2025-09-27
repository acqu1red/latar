import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import TexSchemePage from './TexSchemePage';
import './index.css'; // Импортируем глобальные стили

const App: React.FC = () => {
  return (
    <Router basename="/latar">
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/texscheme" element={<TexSchemePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;