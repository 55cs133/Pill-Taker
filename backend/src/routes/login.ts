import axios from 'axios';
import express from 'express';
import jwt from 'jsonwebtoken';

import { User } from '@/models/user';

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;

const router = express.Router();
router.post('/', async (request, response) => {
  try {
    const { access_token } = request.body;

    console.log(access_token);

    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    console.log(userInfoResponse.data);
    console.log('Oauth request successful! User ID: ', userInfoResponse.data.sub);

    const { sub: googleID, email, name, picture } = userInfoResponse.data;

    const [user, created] = await User.findOrCreate({
      where: { googleID },
      defaults: {
        email,
        name,
        picture,
      },
    });

    if (!created) {
      user.email = email;
      user.name = name;
      user.picture = picture;
      await user.save();
    }

    const sessionToken = jwt.sign(
      { userId: googleID },
      process.env.JWT_SECRET,
      { expiresIn: '20 days' },
    );

    response.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 20 * day,
    });

    response.status(200).json({ message: `Hello ${name}`, user: { name, email } });
  } catch (error) {
    console.error('Google authentication error:', error);
    response.status(401).json({ error: 'Authentication failed' });
  }
});

export default router;
