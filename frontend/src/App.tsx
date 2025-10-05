import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import HomePage from './HomePage';
import TexSchemePage from './TexSchemePage';
import ConstructorPage from './constructor/ConstructorPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import MonochromeClaudeStyle from './NewPage.jsx';
import ProfilePage from './ProfilePage';
import './index.css'; // Импортируем глобальные стили

const App: React.FC = () => {
  // Определяем basename в зависимости от окружения
  const getBasename = () => {
    // Если мы на поддомене new, используем пустой basename
    if (window.location.hostname.includes('new.')) {
      return '';
    }
    // Иначе используем /latar для основного домена
    return '/latar';
  };

  return (
    <AuthProvider>
      <Router basename={getBasename()}>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/texscheme" element={<TexSchemePage />} />
            <Route path="/constructor" element={<ConstructorPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/new" element={<MonochromeClaudeStyle />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;