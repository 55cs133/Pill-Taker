import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  if (req.user) {
    return res.status(200).json({
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture,
    });
  }
  return res.status(401).json({ error: 'Not authenticated' });
});

export default router;
