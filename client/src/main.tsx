import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { App } from './App';
import './index.css';

const defaultClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || '1029384756-sample-volleyball.apps.googleusercontent.com';

const GoogleAuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientId, setClientId] = useState<string>(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');

  useEffect(() => {
    if (!clientId) {
      fetch('/api/auth/config')
        .then((res) => res.json())
        .then((data) => {
          if (data.googleClientId) {
            setClientId(data.googleClientId);
          }
        })
        .catch(() => {});
    }
  }, [clientId]);

  return (
    <GoogleOAuthProvider clientId={clientId || defaultClientId}>
      {children}
    </GoogleOAuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleAuthWrapper>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleAuthWrapper>
  </React.StrictMode>
);
