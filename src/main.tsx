import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ComplaintProvider } from './context/ComplaintContext';
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <ComplaintProvider>
        <App />
        <Toaster />
      </ComplaintProvider>
    </HashRouter>
  </React.StrictMode>
);
