import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';

import { User } from '@/models/user';

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;
const SALT_ROUNDS = 10;

const router = express.Router();

router.post('/register', async (request, response) => {
  try {
    const { email, password, name } = request.body;
    if (!email || !password || !name) {
      return response.status(400).json({ error: 'Email, password and name are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return response.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, passwordHash, name });

    const sessionToken = jwt.sign(
      { userId: user.getDataValue('id') },
      process.env.JWT_SECRET,
      { expiresIn: '20 days' },
    );

    response.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 20 * day,
    });

    response.status(201).json({ message: `Welcome ${name}`, user: { name, email } });
  } catch (error) {
    console.error('Registration error:', error);
    response.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (request, response) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return response.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.getDataValue('passwordHash'));
    if (!valid) {
      return response.status(401).json({ error: 'Invalid credentials' });
    }

    const sessionToken = jwt.sign(
      { userId: user.getDataValue('id') },
      process.env.JWT_SECRET,
      { expiresIn: '20 days' },
    );

    response.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 20 * day,
    });

    response.status(200).json({
      message: `Hello ${user.getDataValue('name')}`,
      user: { name: user.getDataValue('name'), email: user.getDataValue('email') },
    });
  } catch (error) {
    console.error('Login error:', error);
    response.status(500).json({ error: 'Authentication failed' });
  }
});

router.post('/logout', (_request, response) => {
  response.clearCookie('session_token');
  response.status(200).json({ message: 'Logged out' });
});

export default router;
