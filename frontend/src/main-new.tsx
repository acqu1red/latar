import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import MonochromeClaudeStyle from './NewPage.jsx';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router basename="">
        <div className="app">
          <Routes>
            <Route path="/" element={<MonochromeClaudeStyle />} />
            <Route path="/*" element={<MonochromeClaudeStyle />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  </React.StrictMode>,
)
