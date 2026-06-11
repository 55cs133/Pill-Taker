import Avatar from '@mui/material/Avatar';
import { deepOrange } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import React from 'react';
import { useState } from 'react';

import { GoogleButton } from '@/components/GoogleButton';
import { TreatmentForm } from '@/components/TreatmentForm';
import { WordFlipped } from '@/components/WordFlipped';

const backendPort = import.meta.env.API_PORT;

function App() {
  const [status, setStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [mail, setMail] = useState(null);
  const [picture, setPicture] = useState(null);

  const getUserInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:${backendPort}`,
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

  getUserInfo();

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const access_token = tokenResponse.access_token;
      if (access_token) {
        console.log(access_token);

        try {
          const response = await axios.post(`http://localhost:${backendPort}/login`,
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
    <div className="flex flex-col items-center space-y-4">
      <div className="w-1/2">
        <WordFlipped />
      </div>
      <GoogleButton onClick={() => loginWithGoogle()} />
      {status === null && (
        <div>
          <GoogleButton onClick={() => loginWithGoogle()} />
          <Stack direction="row" spacing={2}>
            <Avatar sx={{ bgcolor: deepOrange[500] }}></Avatar>
          </Stack>
        </div>
      )}
      {status && (
        <Stack direction="row">
          <Avatar alt={user} src={picture}></Avatar>
          <Stack direction="column" spacing={1}>
            <p>{user}</p>
            <p>{mail}</p>
          </Stack>
        </Stack>
      )}
      <TreatmentForm />
    </div>
  );
}

export default App;
