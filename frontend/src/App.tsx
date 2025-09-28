import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import TexSchemePage from './TexSchemePage';
import ConstructorPage from './constructor/ConstructorPage';
import './index.css'; // Импортируем глобальные стили

const App: React.FC = () => {
  return (
    <Router basename="/latar">
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/texscheme" element={<TexSchemePage />} />
          <Route path="/constructor" element={<ConstructorPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;