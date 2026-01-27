import { createRoot } from 'react-dom/client'
import { AuthContextProvider } from './context/authContext.jsx'
import { StrictMode } from 'react';
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthContextProvider>
  </StrictMode>
);

