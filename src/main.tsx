import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// SPA redirect from 404.html on GitHub Pages
const redirect = sessionStorage.getItem('spa-redirect');
if (redirect) {
  sessionStorage.removeItem('spa-redirect');
  const base = import.meta.env.BASE_URL; // '/ed-games/'
  const url = new URL(redirect);
  const path = url.pathname.replace(base.replace(/\/$/, ''), '') || '/';
  window.history.replaceState(null, '', base + path.replace(/^\//, '') + url.search + url.hash);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
