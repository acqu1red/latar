import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import TexSchemePage from './TexSchemePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import DashboardPage from './DashboardPage';
import { AuthProvider } from './AuthContext'; // Импорт AuthProvider
import './index.css'; // Импортируем глобальные стили

const App: React.FC = () => {
  return (
    <Router basename="/latar">
      <AuthProvider> {/* Оборачиваем все приложение в AuthProvider */}
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/texscheme" element={<TexSchemePage />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;