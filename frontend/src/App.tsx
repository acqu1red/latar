import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import HomePage from './HomePage';
import TexSchemePage from './TexSchemePage';
import ConstructorPage from './constructor/ConstructorPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ExamplesPage from './ExamplesPage';
import ContactsPage from './ContactsPage';
import PricingPage from './PricingPage';
import FeaturesPage from './FeaturesPage';
import AIPlanPage from './features/AIPlanPage';
import AIConstructorPage from './features/ConstructorPage';
import PhotoCleaningPage from './features/PhotoCleaningPage';
import AutomationPage from './features/AutomationPage';
// @ts-ignore
import MonochromeClaudeStyle from './NewPage.jsx';
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
            <Route path="/examples" element={<ExamplesPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/features/ai-plan" element={<AIPlanPage />} />
            <Route path="/features/constructor" element={<AIConstructorPage />} />
            <Route path="/features/photo-cleaning" element={<PhotoCleaningPage />} />
            <Route path="/features/automation" element={<AutomationPage />} />
            <Route path="/new" element={<MonochromeClaudeStyle />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;