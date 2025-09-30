import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import HomePage from './HomePage';
import TexSchemePage from './TexSchemePage';
import ConstructorPage from './constructor/ConstructorPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import MonochromeClaudeStyle from './NewPage.jsx';
import './index.css'; // Импортируем глобальные стили

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router basename="/latar">
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/texscheme" element={<TexSchemePage />} />
            <Route path="/constructor" element={<ConstructorPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/new" element={<MonochromeClaudeStyle />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;