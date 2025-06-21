import React, { StrictMode } from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeAxeReact } from './utils/axeSetup.js'

// Make React and ReactDOM available globally for axe-core
if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = ReactDOM;
}

// Initialize accessibility testing in development
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  initializeAxeReact();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
