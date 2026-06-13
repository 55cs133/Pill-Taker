import Avatar from '@mui/material/Avatar';
import { deepOrange } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import React from 'react';
import { useState } from 'react';

import { GoogleButton } from '@/components/GoogleButton';
import { TreatmentForm } from '@/components/TreatmentForm';
import { TreatmentList } from '@/components/TreatmentList';
import { TelegramLink } from '@/components/TelegramLink';
import { WordFlipped } from '@/components/WordFlipped';

function App() {
  const [status, setStatus] = useState<boolean | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [mail, setMail] = useState<string | null>(null);
  const [picture, setPicture] = useState<string | null>(null);

  const getUserInfo = async () => {
    try {
      const response = await axios.get('/user-info',
        { withCredentials: true },
      );
      setStatus(true);
      setMail(response.data.email);
      setUser(response.data.name);
      setPicture(response.data.picture);
    } catch (error) {
      console.error('Error:', error);
      setStatus(false);
    }
  };

  React.useEffect(() => {
    getUserInfo();
  }, []);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const access_token = tokenResponse.access_token;
      if (access_token) {
        console.log(access_token);

        try {
          const response = await axios.post('/login',
            { access_token },
            { withCredentials: true },
          );
          console.log(response.data);
          getUserInfo();
        } catch (error) {
          console.error('Login failed:', error);
        }
      } else {
        console.error('No ID token received');
      }
    },
    scope: 'email profile',
  });

  return (
    <div className="flex flex-col items-center space-y-4" style={{ padding: '1rem', minHeight: '100vh' }}>
      <div className="w-1/2">
        <WordFlipped />
      </div>

      {status === null && (
        <div className="flex flex-col items-center space-y-2">
          <GoogleButton onClick={() => loginWithGoogle()} />
          <Stack direction="row" spacing={2}>
            <Avatar sx={{ bgcolor: deepOrange[500] }}></Avatar>
          </Stack>
        </div>
      )}

      {status === false && (
        <div className="flex flex-col items-center space-y-2">
          <p>Please log in to continue</p>
          <GoogleButton onClick={() => loginWithGoogle()} />
        </div>
      )}

      {status && (
        <>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar alt={user || ''} src={picture || ''}></Avatar>
            <Stack direction="column" spacing={0.5}>
              <p style={{ fontWeight: 'bold', margin: 0 }}>{user}</p>
              <p style={{ margin: 0, fontSize: 14, color: '#666' }}>{mail}</p>
            </Stack>
          </Stack>

          <TreatmentList />
          <TelegramLink />
          <TreatmentForm />
        </>
      )}
    </div>
  );
}

export default App;
