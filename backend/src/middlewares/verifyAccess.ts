import jwt from 'jsonwebtoken';

import { User } from '@/models/user';

const excludedRoutes = ['/login'];

export function verifyAccess() {
  return async (req, res, next) => {
    if (excludedRoutes.includes(req.path)) {
      return next();
    }
    try {
      const sessionToken = req.cookies.session_token;
      const decodedToken = jwt.verify(sessionToken, process.env.JWT_SECRET);
      const { userId } = decodedToken;
      const user = await User.findOne({ where: { googleID: userId } });
      if (user) {
        req.user = user;
        return next();
      } else {
        return res.status(401).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Token is missing or falsified:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}
