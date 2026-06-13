import axios from 'axios';
import React, { useEffect, useState } from 'react';

import { LoginForm } from '@/components/LoginForm';
import { TreatmentForm } from '@/components/TreatmentForm';
import { TreatmentList } from '@/components/TreatmentList';
import { TelegramLink } from '@/components/TelegramLink';
import { WordFlipped } from '@/components/WordFlipped';

function App() {
  const [status, setStatus] = useState<boolean | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [mail, setMail] = useState<string | null>(null);

  const getUserInfo = async () => {
    try {
      const response = await axios.get('/user-info', { withCredentials: true });
      setStatus(true);
      setMail(response.data.email);
      setUser(response.data.name);
    } catch (error) {
      console.error('Error:', error);
      setStatus(false);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/login/logout', {}, { withCredentials: true });
      setStatus(false);
      setUser(null);
      setMail(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4" style={{ padding: '1rem', minHeight: '100vh' }}>
      <div className="w-1/2">
        <WordFlipped />
      </div>

      {status === null && <p>Loading...</p>}

      {status === false && <LoginForm onLogin={getUserInfo} />}

      {status && (
        <>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>{user}</p>
            <p style={{ margin: 0, fontSize: 14, color: '#666' }}>{mail}</p>
            <button onClick={handleLogout} style={{ marginTop: 8, padding: '6px 12px' }}>
              Logout
            </button>
          </div>

          <TreatmentList />
          <TelegramLink />
          <TreatmentForm />
        </>
      )}
    </div>
  );
}

export default App;
